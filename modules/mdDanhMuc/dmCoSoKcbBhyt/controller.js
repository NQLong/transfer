module.exports = app => {

    app.get('/api/danh-muc/co-so-kcb-bhyt/get-all-for-adapter', app.permission.check(), async (req, res) => {
        try {
            let searchTerm = req.query.searchTerm;
            let items = await app.model.dmCoSoKcbBhyt.getAll({
                statement: 'loaiDangKy != 0 AND (lower(ma) LIKE :searchTerm OR lower(ten) LIKE :searchTerm OR lower(diaChi) LIKE :searchTerm)',
                parameter: { searchTerm: `%${searchTerm?.toLowerCase() || ''}%` }
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/co-so-kcb-bhyt/item/:ma', app.permission.check(), async (req, res) => {
        try {
            let item = await app.model.dmCoSoKcbBhyt.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};