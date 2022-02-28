module.exports = (app, appConfig) => {
    const db = appConfig.db, redisDB = appConfig.redisDB;
    // Connect RedisDB ------------------------------------------------------------------------------------------------------------------------------
    const redis = require('redis');
    app.redis = app.isDebug ? redis.createClient() : redis.createClient(redisDB.port, redisDB.host, { enable_offline_queue: false });
    !app.isDebug && app.redis.auth(redisDB.auth);

    app.redis.on('connect', () => {
        console.log(` - #${process.pid}: The Redis connection succeeded.`);
    });

    app.redis.on('error', error => {
        console.log(` - #${process.pid}: The Redis connection failed!`, error.message);
        app.redis.end(true);
    });

    // Connect OracleDB -----------------------------------------------------------------------------------------------------------------------------
    app.oracleDB = require('oracledb');
    app.oracleDB.autoCommit = true;
    app.oracleDB.outFormat = app.oracleDB.OBJECT; // other option is 'oracleDB.ARRAY'
    app.oracleDB.fetchAsString = [app.oracleDB.CLOB];
    const timeout = 10;
    const timeoutPromise = () => new Promise((i, reject) => setTimeout(() => reject(`Timeout in ${timeout}s.`), 1000 * timeout));

    Promise.race([app.oracleDB.getConnection({
        connectString: `(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = ${db.host})(PORT = 1521)) (CONNECT_DATA = (SID = ${db.sid})) )`,
        user: db.username,
        password: db.password,
    }), timeoutPromise()]).then(connection => {
        if (connection) {
            console.log(` - #${process.pid}: The Oracle connection succeeded.`);
            app.dbConnection = connection;
            app.dbConnection.buildCondition = (mapper, condition, seperation, preParam = '') => {
                if (condition.statement && condition.parameter) {
                    Object.keys(mapper).sort((a, b) => b.length - a.length).forEach(key => condition.statement = condition.statement.replaceAll(new RegExp('(?<!(:))' + key, 'g'), mapper[key]));
                    let newCondition = {
                        statement: condition.statement,
                        parameter: {}
                    };
                    Object.keys(condition.parameter).sort((a, b) => b.length - a.length).forEach(key => {
                        let listVariable = '';
                        if (Array.isArray(condition.parameter[key])) {
                            for (let i = 0; i < condition.parameter[key].length; i++) {
                                listVariable += ':' + key + i + ' , ';
                                newCondition.parameter[key + i] = condition.parameter[key][i];
                            }
                            newCondition.statement = newCondition.statement.replaceAll('\\(:' + key + '\\)', '(' + listVariable.substring(listVariable.length - 3, 0) + ')');
                        } else {
                            newCondition.parameter[key] = condition.parameter[key];
                        }
                    });
                    return newCondition;
                } else {
                    let statement = '', parameter = {};
                    Object.keys(condition).forEach(field => {
                        if (mapper[field]) {
                            if (seperation == ', ' || condition[field] != null) {
                                statement += seperation + mapper[field] + '=:' + preParam + field;
                                parameter[preParam + field] = condition[field];
                            } else {
                                statement += seperation + mapper[field] + ' IS NULL';
                            }
                        } else if (field.toUpperCase() == 'ROWID') {
                            statement += seperation + 'ROWID=:' + preParam + 'row_Id';
                            parameter[preParam + 'row_Id'] = condition['rowId'];
                        }
                    });
                    return statement.length > 0 ? { statement: statement.substring(seperation.length), parameter } : {};
                }
            };

            app.dbConnection.parseSelectedColumns = (mapper, selectedColumns) => {
                if (selectedColumns == '*') selectedColumns = Object.keys(mapper).toString();
                let strColumns = '';
                selectedColumns.split(',').forEach(fieldName => strColumns += ', ' + mapper[fieldName] + ' AS "' + fieldName + '"');
                return strColumns.length > 0 ? strColumns.substring(2) : '';
            };

            const CursorNumber = 100;
            app.dbConnection.fetchRowsFromResultSet = (resultSet) => new Promise(resolve => {
                const list = [],
                    fetchRow = rows => {
                        if (rows.length > 0) {
                            list.push(...rows);
                            resultSet.getRows(CursorNumber).then(fetchRow);
                        } else {
                            resolve(list);
                        }
                    };
                resultSet ? resultSet.getRows(CursorNumber).then(fetchRow) : resolve([]);
            });
            const objectFromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));
            const transpose = m => m[0].map((x, i) => m.map(x => x[i]));
            const promiseAllObject = obj => new Promise(resolve => {
                const kvArray = transpose(Object.entries(obj));
                Promise.all(kvArray[1]).then(resolvedValues => resolve(objectFromEntries(transpose([kvArray[0], resolvedValues]))));
            });
            app.dbConnection.fetchRowsFromCursor = (error, result, done) => {
                if (error) {
                    done(error);
                } else if (result && result.outBinds) {
                    const fetchPromises = {};
                    Object.keys(result.outBinds).forEach(key => {
                        if (result.outBinds[key] instanceof (app.oracleDB.ResultSet)) {
                            fetchPromises[key === 'ret' ? 'rows' : key] = app.dbConnection.fetchRowsFromResultSet(result.outBinds[key]);
                        } else {
                            fetchPromises[key] = result.outBinds[key];
                        }
                    });
                    promiseAllObject(fetchPromises).then(resolvedResult => done(null, resolvedResult));
                } else {
                    done('The fetchRowsFromCursor has errors!');
                }
            };

            setTimeout(() => { //Test model functions
                // app.model.canBo.getAll({
                //     statement: 'email IN (  :emails  ) AND ho IN ( :abcd) AND ten=:search',
                //     parameter: {
                //         emails: ['emaila@gmail.com', 'emailb@gmail.com'],
                //         abcd: ['1111', '2222'],
                //         search: 'TÙNG'
                //     }
                // }, (error, items) => console.log(error, items));

                // app.model.fwUser.getUserRoles('tester@hcmut.edu.vn', (error, result) => {
                //     result && console.log(result.rows)
                // });
            }, 1000);
        }
    }).catch(error => {
        console.log(` - #${process.pid}: Could not connect to Oracle!`, error);
        console.error(error);
        process.exit(1);
    });

    // Define all models --------------------------------------------------------------------------
    app.model = {};
};
