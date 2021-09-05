module.exports = app => {
    app.get('/api/sinh-vien/page/:pageNumber/:pageSize', app.permission.check('user:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(mssv) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText OR email LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.fwStudent.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/sinh-vien/item/:mssv', app.permission.check('user:read'), (req, res) => {
        app.model.canBo.get({ mssv: req.params.mssv }, (error, item) => res.send({ error, item }));
    });
};