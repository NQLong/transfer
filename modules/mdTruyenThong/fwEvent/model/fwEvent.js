const keys = ['ID'];
const obj2Db = { 'priority': 'PRIORITY', 'name': 'NAME', 'title': 'TITLE', 'image': 'IMAGE', 'link': 'LINK', 'active': 'ACTIVE', 'isInternal': 'IS_INTERNAL', 'location': 'LOCATION', 'abstract': 'ABSTRACT', 'content': 'CONTENT', 'maxRegisteredUsers': 'MAX_REGISTERED_USERS', 'trainingPoint': 'TRAINING_POINT', 'socialWorkDay': 'SOCIAL_WORK_DAY', 'createdDate': 'CREATED_DATE', 'startPost': 'START_POST', 'stopPost': 'STOP_POST', 'startRegister': 'START_REGISTER', 'stopRegister': 'STOP_REGISTER', 'startEvent': 'START_EVENT', 'stopEvent': 'STOP_EVENT', 'views': 'VIEWS', 'form': 'FORM', 'id': 'ID', 'isTranslate': 'IS_TRANSLATE', 'language': 'LANGUAGE', 'maDonVi': 'MA_DON_VI' };

module.exports = app => {
    app.model.fwEvent.create2 = (data, done) => {
        app.model.fwEvent.get({}, '*', 'priority DESC', (error, event) => {
            data.priority = error || event == null ? 1 : event.priority + 1;

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
                const sql = 'INSERT INTO FW_EVENT (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwEvent.get({ rowId: resultSet.lastRowid }, (error, event) => {
                            if (error) {
                                done(error);
                            } else {
                                // if (app.data && app.data.numberOfEvent) app.data.numberOfEvent++;
                                const image = '/img/event/' + event.id + '.jpg';
                                const srcPath = app.path.join(app.publicPath, '/img/avatar.png'),
                                    destPath = app.path.join(app.publicPath, image);
                                app.fs.copyFile(srcPath, destPath, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        app.model.fwEvent.update({ rowId: resultSet.lastRowid }, { image }, done);
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

    app.model.fwEvent.delete2 = (condition, done) => {
        app.model.fwEvent.get(condition, (error, event) => {
            if (error || event === null) {
                done(error);
            } else {
                app.model.fwEventCategory.getAll({ eventId: event.id }, (error, items) => {
                    if (error) {
                        done(error);
                    } else if (!items || !items.length) {
                        app.model.fwDraft.delete2({ documentId: event.id }, error => {
                            if (error) {
                                done(error);
                            } else {
                                // if (app.data && app.data.numberOfEvent) app.data.numberOfEvent--;
                                app.fs.deleteImage(event.image);
                                app.model.fwEvent.delete(condition, done);
                            }
                        });
                    } else {
                        app.model.fwEventCategory.delete({ eventId: event.id }, error => {
                            if (error) {
                                done(error);
                            } else {
                                app.model.fwDraft.delete2({ documentId: event.id }, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        // if (app.data && app.data.numberOfEvent) app.data.numberOfEvent--;
                                        app.fs.deleteImage(event.image);
                                        app.model.fwEvent.delete(condition, done);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };

    app.model.fwEvent.createWithPriority = (data, done) => {
        app.model.fwEvent.get({}, '*', 'priority DESC', (error, event) => {
            data.priority = error || event == null ? 1 : event.priority + 1;

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
                const sql = 'INSERT INTO FW_EVENT (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwEvent.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        });
    };

    app.model.fwEvent.swapPriority = (id, isMoveUp, done) => {
        app.model.fwEvent.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid event Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                                SELECT t.*
                                FROM HCMUSSH.FW_EVENT t
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
                        app.model.fwEvent.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwEvent.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        });
                    }
                });
            }
        });
    };

    app.model.fwEvent.getByLink = (link, done) => app.model.fwEvent.get({ link }, done);

    app.model.fwEvent.getByEnLink = (linkEn, done) => app.model.fwEvent.get({ linkEn }, done);

    app.model.fwEvent.read = (condition, done) => {
        app.model.fwEvent.getAll(condition, (error, items) => {
            if (error) {
                done(error);
            } else if (items == null || items.length != 1) {
                done('Invalid Id!');
            } else {
                const views = ++items[0].views;
                app.model.fwEvent.update(condition, { views }, (error, item) => {
                    app.io.emit('event:item-view-changed', item.id, item.views);
                    done(error, item);
                });
            }
        });
    };

    app.model.fwEvent.readById = (id, done) => app.model.fwEvent.read({ id, active: 1 }, done);

    app.model.fwEvent.readByLink = (link, done) => app.model.fwEvent.read({ link, active: 1 }, done);

    app.model.fwEvent.getEventPageWithCategory = (category, pageNumber, pageSize, condition, selectedColumns, orderBy, done) => {
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
            selectedColumns = '*';
        } else if (selectedColumns && typeof selectedColumns == 'function') {
            done = selectedColumns;
            selectedColumns = '*';
        }
        if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
        condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
        let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
            parameter = condition.parameter ? condition.parameter : {};
        const sql_count = `SELECT COUNT(*)
                                FROM (SELECT FN.*, FC.ID AS CATEGORY_ID, FC.TITLE AS CATEGORY_TITLE
                                    FROM FW_EVENT FN
                                        INNER JOIN FW_EVENT_CATEGORY FNC on FN.ID = FNC.EVENT_ID
                                        INNER JOIN FW_CATEGORY FC on FNC.CATEGORY_ID = FC.ID)
                                    WHERE CATEGORY_ID IN (` + category + ')' + (condition.statement ? ' AND ' + condition.statement.replaceAll('FN.ACTIVE', 'ACTIVE') : '');
        app.database.oracle.connection.main.execute(sql_count, parameter, (err, res) => {
            let result = {};
            let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
            result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
            result.pageNumber = pageNumber === -1 ? 1 : Math.min(pageNumber, result.pageTotal);
            leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ', CATEGORY_ID AS "category_Id", CATEGORY_TITLE AS "category_Title" ' + 'FROM (SELECT FN.*, COUNT(*) over (partition by FN.ID) AS CNT, FC.ID AS CATEGORY_ID, FC.TITLE AS CATEGORY_TITLE, ROW_NUMBER() OVER (ORDER BY '
                + (orderBy ? ' FN.' + orderBy : ' FN.' + keys) + ') R FROM FW_EVENT FN INNER JOIN FW_EVENT_CATEGORY FNC on FN.ID = FNC.EVENT_ID INNER JOIN FW_CATEGORY FC on FNC.CATEGORY_ID = FC.ID WHERE CATEGORY_ID IN( '
                + category + ')' + (condition.statement ? ' AND ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize) + (condition.statement ? ' AND CNT = 1' : '');
            app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                done(error, result);
            });
        });
    };
};