module.exports = app => {
    app.permission.add({ name: 'staff:login' });

    app.get('/user/dang-ky-so', app.permission.check('staff:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/dang-ky-so/search/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const pageNumber1 = parseInt(req.params.pageNumber),
                pageSize1 = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';

            let { tab } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter : {},
                tabValue = parseInt(tab);



            const page = await app.model.hcthSoDangKy.searchPage(pageNumber1, pageSize1, tabValue, searchTerm);

            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;

            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });

        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/dang-ky-so/:id', app.permission.check('staff:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw { status: 400, message: 'Invalid id' };
            }
            const soDangKy = await app.model.hcthSoDangKy.get({ id });
            res.send({ item: soDangKy });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/dang-ky-so/tu-dong', app.permission.check('staff:login'), async (req, res) => {
        try {
            const data = req.body.data;
            let { capVanBan, loaiVanBan, donViGui, tuDong } = data;
            const currentYear = new Date().getFullYear();
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const nam = Date.parse(firstDayOfYear);

            const ngayTao = new Date().getTime();

            try {
                await app.model.hcthSoDangKy.createSoVanBan(donViGui, capVanBan, loaiVanBan, nam, tuDong, ngayTao);
            } catch {
                throw { message: 'Số văn bản không hợp lệ' };
            }
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcth/dang-ky-so/nhap-tay', app.permission.check('staff:login'), async (req, res) => {
        try {
            const data = req.body.data;
            let { soDangKy, capVanBan, donViGui, tuDong } = data;
            const currentYear = new Date().getFullYear();
            const firstDayOfYear = new Date(currentYear, 0, 1);
            const nam = Date.parse(firstDayOfYear);

            try {
                await app.model.hcthSoDangKy.validateSoCongVan(soDangKy, capVanBan, donViGui, nam);
            } catch {
                throw { message: 'Số văn bản không hợp lệ' };
            }
            await app.model.hcthSoDangKy.create({
                soCongVan: soDangKy,
                loaiCongVan: capVanBan,
                donViGui: donViGui,
                ngayTao: new Date().getTime(),
                tuDong: tuDong,
                suDung: 0
            });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

};
