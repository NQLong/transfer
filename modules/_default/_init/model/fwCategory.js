const obj2Db = { 'id': 'ID', 'priority': 'PRIORITY', 'type': 'TYPE', 'title': 'TITLE', 'image': 'IMAGE', 'active': 'ACTIVE', 'maDonVi': 'MA_DON_VI' };

// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwCategory.foo = () => { };
    app.model.fwCategory.create2 = (data, done) => {
        app.model.fwCategory.get({}, '*', 'priority DESC', (error, news) => {
            data.priority = error || news == null ? 1 : news.priority + 1;

            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done('Data is empty!');
            } else {
                const sql = 'INSERT INTO FW_CATEGORY (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwCategory.get({ rowId: resultSet.lastRowid }, (error, item) => {
                            if (error) {
                                done(error);
                            } else {
                                const destFolder = app.path.join(app.publicPath, '/img/' + data.type + 'Category');
                                if (!app.fs.existsSync(destFolder)) app.fs.mkdirSync(destFolder);

                                let image = '/img/' + data.type + 'Category/' + item.id + '.jpg';
                                const srcPath = app.path.join(app.publicPath, item.image),
                                    destPath = app.path.join(app.publicPath, image);
                                app.fs.copyFile(srcPath, destPath, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        app.model.fwCategory.update({ rowId: resultSet.lastRowid }, { image }, (error, item) => done(error, item));
                                    }
                                });
                            }
                        });
                    } else {
                        done(error);
                    }
                });
            }
        });
    };

    app.model.fwCategory.delete2 = (condition, done) => {
        app.model.fwCategory.get(condition, (error, category) => {
            if (error || category === null) {
                done(error);
            } else {
                const modelCategoryName = 'fw' + category.type[0].toUpperCase() + category.type.substring(1) + 'Category';
                app.model[modelCategoryName].getAll({ categoryId: category.id }, (error, items) => {
                    if (error) {
                        done(error);
                    } else if (!items || !items.length) {
                        app.model.fwCategory.delete(condition, error => done(error));
                    } else {
                        app.model[modelCategoryName].delete({ categoryId: category.id }, error => {
                            if (error) {
                                done(error);
                            } else {
                                app.model.fwCategory.delete(condition, error => done(error));
                            }
                        });
                    }
                });
            }
        });
    };

    app.model.fwCategory.swapPriority = (id, isMoveUp, done) => {
        app.model.fwCategory.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid news Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                    SELECT t.*
                    FROM HCMUSSH.FW_CATEGORY t
                    ORDER BY PRIORITY${order}
                ) WHERE PRIORITY ${operator} :priority AND ROWNUM <= :limit`;
                app.database.oracle.connection.main.execute(sql, { priority: item1.priority, limit: 1 }, (error, { rows }) => {
                    if (error) {
                        done(error);
                    } else if (rows === null || rows.length === 0) {
                        done(null);
                    } else {
                        let item2 = rows[0],
                            { priority } = item1;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        app.model.fwCategory.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwCategory.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        });
                    }
                });
            }
        });
    };
};