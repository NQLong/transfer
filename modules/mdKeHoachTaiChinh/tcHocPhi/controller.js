module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5002: { title: 'Học phí', link: '/user/finance/hoc-phi' },
        },
    };
    app.permission.add(
        { name: 'tcHocPhi:read', menu },
        { name: 'tcHocPhi:write' },
        { name: 'tcHocPhi:delete' },
    );

    app.get('/user/finance/hoc-phi', app.permission.check('tcHocPhi:read'), app.templates.admin);
    app.get('/user/finance/hoc-phi/:mssv', app.permission.check('tcHocPhi:read'), app.templates.admin);

    //APIs----------------------------------------------------------------------------------
    app.get('/api/finance/page/:pageNumber/:pageSize', app.permission.check('tcHocPhi:read'), async (req, res) => {
        let { pageNumber, pageSize } = req.params;
        let searchTerm = `%${req.query.searchTerm || ''}%`;
        const { namHoc, hocKy } = await app.model.tcSetting.getValue(['namHoc', 'hocKy']);
        let filter = app.stringify(app.clone(req.query.filter || {}, { namHoc, hocKy }), '');
        app.model.tcHocPhi.searchPage(parseInt(pageNumber), parseInt(pageSize), searchTerm, filter, (error, page) => {
            if (error || !page) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({
                    page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }
                });
            }
        });
    });

    app.get('/api/finance/hoc-phi-transactions/:mssv', app.permission.check('tcHocPhi:read'), async (req, res) => {
        const { namHoc, hocKy } = await app.model.tcSetting.getValue(['namHoc', 'hocKy']),
            mssv = req.params.mssv;
        app.model.fwStudents.get({ mssv }, (error, sinhVien) => {
            if (error) res.send({ error });
            else if (!sinhVien) res.send({ error: 'Sinh viên không tồn tại' });
            else {
                app.model.tcHocPhiTransaction.getAll({
                    customerId: mssv, hocKy, namHoc
                }, (error, items) => res.send({ error, items, sinhVien, hocKy, namHoc }));
            }
        });
    });
};