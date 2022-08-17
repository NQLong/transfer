module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5008: { title: 'Định mức học phí', link: '/user/finance/dinh-muc-hoc-phi' } },
    };

    app.permission.add(
        { name: 'tcDinhMucHocPhi:manage', menu },
        { name: 'tcDinhMucHocPhi:write' },
        { name: 'tcDinhMucHocPhi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDinhMucHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDinhMucHocPhi:manage', 'tcDinhMucHocPhi:write', 'tcDinhMucHocPhi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:manage'), app.templates.admin);
    // API ---------------------------------------------------------------------------------------------------
    // app.get('/api/finance/dinh-muc-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
    //     try {
    //         const pageNumber = parseInt(req.params.pageNumber),
    //             pageSize = parseInt(req.params.pageSize),
    //             searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
    //             filter = req.query.filter || {};
    //         let page = await app.model.tcDinhMucHocPhi.searchPage(pageNumber, pageSize, app.utils.stringify(filter), searchTerm);
    //         let list = page.rows;

    //         res.send({ page });

    //         // for (let index = 0; index < list.length; index++) {
    //         //     let item = list[index];
    //         //     await app.model.tcDinhMucHocPhi.getAll({ namBatDau: item.namBatDau, namKetThuc: item.namKetThuc, hocKy: item.hocKy, loaiPhi: item.loaiPhi }, (error, listDinhMuc) => {
    //         //         list[index].loaiDaoTao = listDinhMuc?.map(dmItem => ({ ma: dmItem.ma, loaiDaoTao: dmItem.loaiDaoTao, soTien: dmItem.soTien }));
    //         //     });
    //         // }

    //         // const pageCondition = searchTerm;
    //         // res.send({
    //         //     page: { totalItem: page.totalitem, pageSize: page.pagesize, pageTotal: page.pagetotal, pageNumber: page.pagenumber, pageCondition, list }
    //         // });

    //     } catch (error) {
    //         console.log(error);
    //         res.send({ error });
    //     }
    // });

    app.get('/api/finance/dinh-muc-hoc-phi/get-item', app.permission.check('tcDinhMucHocPhi:manage'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            if (!filter.namHoc) res.send({ error: 'Missing parameters!' });
            else {
                const item = await app.model.tcDinhMucHocPhi.getItemBy(app.utils.stringify(filter));
                res.send({ item: item.rows });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/dinh-muc-hoc-phi/all', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            let items = await app.model.tcDinhMucHocPhi.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/dinh-muc-hoc-phi/item/:ma', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            const item = await app.model.tcDinhMucHocPhi.get({ ma: req.params.ma });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/finance/dinh-muc-hoc-phi/multiple', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            const data = req.body.data, listError = [];
            for (const item of data) {
                let { namHoc, loaiDaoTao, bacDaoTao, soTien } = item;
                let check = await app.model.tcDinhMucHocPhi.get({ namHoc, loaiDaoTao });
                if (check) listError.push({ loaiDaoTao, soTienCu: check.soTien, bacDaoTao, soTien, ma: check.ma });
                else {
                    await app.model.tcDinhMucHocPhi.create(item);
                }
            }
            res.send({ listError });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            let items = [];

            for (let index = 0; index < changes.loaiDaoTao.length; index++) {
                let newData = {
                    namBatDau: changes.namBatDau,
                    namKetThuc: changes.namKetThuc,
                    hocKy: changes.hocKy,
                    soTienMacDinh: changes.soTienMacDinh,
                    loaiPhi: changes.loaiPhi,
                    loaiDaoTao: changes.loaiDaoTao[index].loaiDaoTao,
                    soTien: changes.loaiDaoTao[index].soTien
                };
                let newItem = await app.model.tcDinhMucHocPhi.update({ ma: changes.loaiDaoTao[index].ma }, newData);
                items.push(newItem);
            }

            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:delete'), async (req, res) => {
        try {
            const listMa = req.body.listMa,
                condition = {
                    statement: 'ma in (:listMa)',
                    parameter: {
                        listMa: listMa
                    }
                };
            await app.model.tcDinhMucHocPhi.delete(condition);
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};