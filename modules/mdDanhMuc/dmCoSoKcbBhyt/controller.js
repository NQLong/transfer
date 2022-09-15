module.exports = app => {

    app.get('/api/danh-muc/co-so-kcb-bhyt/get-all-for-adapter', app.permission.check('user:login'), async (req, res) => {
        try {
            let { searchTerm, type } = req.query;
            const statement = !type ? 'loaiDangKy != 0' : 'loaiDangKy = 2';
            let items = await app.model.dmCoSoKcbBhyt.getAll({
                statement: `${statement} AND (lower(ma) LIKE :searchTerm OR lower(ten) LIKE :searchTerm OR lower(diaChi) LIKE :searchTerm)`,
                parameter: { searchTerm: `%${searchTerm?.toLowerCase() || ''}%` }
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/danh-muc/co-so-kcb-bhyt/item/:ma', app.permission.check('user:login'), async (req, res) => {
        try {
            let item = await app.model.dmCoSoKcbBhyt.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });
};