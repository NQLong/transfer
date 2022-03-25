const obj2Db = { 'title': 'TITLE', 'image': 'IMAGE', 'description': 'DESCRIPTION', 'active': 'ACTIVE', 'isLocked': 'IS_LOCKED', 'priority': 'PRIORITY', 'maxRegisteredUsers': 'MAX_REGISTERED_USERS', 'createdDate': 'CREATED_DATE', 'startRegister': 'START_REGISTER', 'stopRegister': 'STOP_REGISTER', 'id': 'ID' };

// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwForm.foo = () => { };

    app.model.fwForm.createWithPriority = (data, done) => {
        app.model.fwForm.get({}, '*', 'priority DESC', (error, form) => {
            data.priority = error || form == null ? 1 : form.priority + 1;


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
                const sql = 'INSERT INTO FW_FORM (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwForm.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        });
    };

    app.model.fwForm.swapPriority = (id, isMoveUp, done) => {
        app.model.fwForm.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done && done('Invalid news Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                                SELECT t.*
                                FROM HCMUSSH.FW_FORM t
                                ORDER BY PRIORITY${order}
                            ) WHERE PRIORITY ${operator} :priority AND ROWNUM <= :limit`;
                app.database.oracle.connection.main.execute(sql, { priority: item1.priority, limit: 1 }, (error, { rows }) => {
                    if (error) {
                        done && done(error);
                    } else if (rows === null || rows.length === 0) {
                        done && done(null);
                    } else {
                        let item2 = rows[0],
                            { priority } = item1;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        app.model.fwForm.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwForm.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        });
                    }
                });
            }
        });
    };
};