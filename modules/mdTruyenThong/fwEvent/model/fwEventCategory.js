const obj2Db = { 'eventId': 'EVENT_ID', 'categoryId': 'CATEGORY_ID' };
// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwEventCategory.foo = () => { };
    app.model.fwEventCategory.createMany = (data, done) => {
        let statement = '', values = '', parameter = [];
        for (let i = 0; i < data.length; i++) {
            Object.keys(data[i]).forEach(column => {
                if (obj2Db[column]) {
                    if (i === 0) {
                        statement += ', ' + obj2Db[column];
                        values += ', :' + column;
                    }
                    if (!parameter[i]) parameter[i] = {};
                    parameter[i][column] = parseInt(data[i][column]);
                }
            });
        }

        if (statement.length == 0) {
            done('Data is empty!');
        } else {
            const sql = 'INSERT INTO FW_EVENT_CATEGORY (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
            app.database.oracle.connection.main.executeMany(sql, parameter, (error, resultSet) => {
                if (error || resultSet === null)
                    done(error);
                else if (!resultSet.rowsAffected)
                    done('Execute SQL command fail! Sql = ' + sql);
                else
                    done();
            });
        }
    };
};