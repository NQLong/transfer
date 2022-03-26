// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwContact.foo = () => { };
    app.model.fwContact.searchPage = (pageNumber, pageSize, readState, searchTerm, done) => {
        app.database.oracle.connection.main.execute('BEGIN :ret:=contact_search_page(:pageNumber, :pageSize, :readState, :searchTerm, :totalItem, :pageTotal); END;',
            { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pageNumber: { val: pageNumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pageSize: { val: pageSize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, readState, searchTerm, totalItem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pageTotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, done));
    };
};