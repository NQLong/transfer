const keys = ['ID'];
const obj2Db = { 'width': 'WIDTH', 'display': 'DISPLAY', 'lang': 'LANG', 'payload': 'PAYLOAD', 'type': 'TYPE', 'inewsId': 'INEWS_ID', 'priority': 'PRIORITY', 'id': 'ID' };

// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwInewsItem.foo = () => { };
    app.model.fwInewsItem.swapPriority = (id, inewsId, isMoveUp, done) => {
        app.model.fwInewsItem.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done && done('Invalid question Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                                SELECT t.*
                                FROM HCMUSSH.FW_INEWS_ITEM t
                                ORDER BY PRIORITY${order}
                            ) WHERE INEWS_ID = :inewsId AND PRIORITY ${operator} :priority AND ROWNUM <= :limit`;
                app.dbConnection.execute(sql, { priority: item1.priority, limit: 1, inewsId }, (error, { rows }) => {
                    if (error) {
                        done && done(error);
                    } else if (rows === null || rows.length === 0) {
                        done && done(null);
                    } else {
                        let item2 = rows[0],
                            { priority } = item1;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        app.model.fwInewsItem.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwInewsItem.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        });
                    }
                });
            }
        });
    };

    app.model.fwInewsItem.createWithPriority = (data, done) => {
        app.model.fwInewsItem.get({ inewsId: data.inewsId }, '*', 'priority DESC', (error, item) => {
            data.priority = error || item == null ? 1 : item.priority + 1;

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
                const sql = 'INSERT INTO FW_INEWS_ITEM (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwInewsItem.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        });
    };

    app.model.fwInewsItem.delete2 = (id, done) => {
        app.model.fwInewsItem.getAll({ inewsId: id }, '*', 'priority DESC', (error, items) => {
            if (error) {
                done(error);
            } else {
                for (const item of items) {
                    item.type === 'image' && app.deleteImage(item.payload);
                }

                app.model.fwInewsItem.delete({ inewsId: id }, error => {
                    done(error);
                });
            }
        });
    };
};