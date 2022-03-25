const obj2Db = { 'answerId': 'ANSWER_ID', 'questionId': 'QUESTION_ID', 'answer': 'ANSWER', 'id': 'ID' };

// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwAnswerRecord.foo = () => { };
    app.model.fwAnswerRecord.createMany = (data, done) => {
        let statement = '', values = '', parameter = [];
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
            const sql = 'INSERT INTO FW_ANSWER_RECORD (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
            app.database.oracle.connection.main.executeMany(sql, parameter, (error, resultSet) => {
                if (!error || !resultSet.rowsAffected) {
                    done();
                } else {
                    done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                }
            });
        }
    };
};