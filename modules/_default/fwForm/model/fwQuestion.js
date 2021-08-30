const keys = ['ID'];
const obj2Db = { 'active': 'ACTIVE', 'title': 'TITLE', 'content': 'CONTENT', 'typeName': 'TYPE_NAME', 'typeValue': 'TYPE_VALUE', 'rowNums': 'ROW_NUMS', 'id': 'ID', 'formId': 'FORM_ID', 'priority': 'PRIORITY' };

module.exports = app => {
    // app.model.fwQuestion.foo = () => { };
    app.model.fwQuestion.createMany = (data, done) => {
        let statement = '', values = '', parameter = [];
        // app.model.fwForm.get({}, '*', 'priority DESC', (error, form) => {
        //     data.priority = error || form == null ? 1 : form.priority + 1;
        for (let i = 0; i < data.length; i++) {
            Object.keys(data[i]).forEach(column => {
                if (obj2Db[column]) {
                    if (i === 0) {
                        statement += ', ' + obj2Db[column];
                        values += ', :' + column;
                    }
                    if (!parameter[i]) parameter[i] = {};
                    parameter[i][column] = data[i][column];
                }
            });
        }

        if (statement.length == 0) {
            done('Data is empty!');
        } else {
            const sql = 'INSERT INTO FW_QUESTION (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
            app.dbConnection.executeMany(sql, parameter, (error, resultSet) => {
                if (!error || !resultSet.rowsAffected) {
                    done()
                } else {
                    done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                }
            });
        }
    }

    app.model.fwQuestion.swapPriority = (id, formId, isMoveUp, done) => {
        app.model.fwQuestion.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done && done('Invalid question Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                                SELECT t.*
                                FROM HCMUSSH.FW_QUESTION t
                                ORDER BY PRIORITY${order}
                            ) WHERE FORM_ID = :formId AND PRIORITY ${operator} :priority AND ROWNUM <= :limit`;
                app.dbConnection.execute(sql, { priority: item1.priority, limit: 1, formId }, (error, { rows }) => {
                    if (error) {
                        done && done(error);
                    } else if (rows === null || rows.length === 0) {
                        done && done(null);
                    } else {
                        let item2 = rows[0],
                            { priority } = item1;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        app.model.fwQuestion.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwQuestion.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        })
                    }
                });
            }
        });
    }

    app.model.fwQuestion.createWithPriority = (formId, data, done) => {
        app.model.fwQuestion.get({ formId }, '*', 'priority DESC', (error, form) => {
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
                const sql = 'INSERT INTO FW_QUESTION (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwQuestion.get({ rowId: resultSet.lastRowid }, done);
                    } else {
                        done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        });
    }
}