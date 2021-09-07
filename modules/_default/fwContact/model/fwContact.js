// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwContact.foo = () => { };
    app.model.fwContact.searchPage = (pageNumber, pageSize, readState, searchTerm, done) => {
        app.dbConnection.execute('BEGIN :ret:=contact_search_page(:pageNumber, :pageSize, :readState, :searchTerm, :totalItem, :pageTotal); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.CURSOR }, pageNumber: { val: pageNumber, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, pageSize: { val: pageSize, dir: app.oracleDB.BIND_INOUT, type: app.oracleDB.NUMBER }, readState, searchTerm, totalItem: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, pageTotal: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER } }, (error, result) => app.dbConnection.fetchRowsFromCursor(error, result, done));
    };
};