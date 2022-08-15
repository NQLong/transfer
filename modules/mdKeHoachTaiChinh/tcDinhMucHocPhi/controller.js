module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5008: { title: 'Định mức học phí', link: '/user/finance/dinh-muc-hoc-phi' } },
    };

    app.permission.add(
        { name: 'tcDinhMucHocPhi:read', menu },
        { name: 'tcDinhMucHocPhi:write' },
        { name: 'tcDinhMucHocPhi:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesTcDinhMucHocPhi', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcDinhMucHocPhi:read', 'tcDinhMucHocPhi:write', 'tcDinhMucHocPhi:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:read'), app.templates.admin);
    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/finance/dinh-muc-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('tcDinhMucHocPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
                const { namBatDau, namKetThuc, hocKy, loaiPhi } = (req.query.filter && req.query.filter != '%%%%%') ? req.query.filter : { namBatDau: null, namKetThuc: null, hocKy: null, loaiPhi: null, loaiDaoTao: null };
            let page = await app.model.tcDinhMucHocPhi.searchPage(pageNumber, pageSize, namBatDau, namKetThuc, hocKy, loaiPhi, searchTerm);
            let list = page.rows;

            for(let index = 0;index <list.length; index++) {
                let item = list[index];
                await app.model.tcDinhMucHocPhi.getAll({ namBatDau: item.namBatDau, namKetThuc: item.namKetThuc, hocKy: item.hocKy, loaiPhi: item.loaiPhi }, (error, listDinhMuc) => {
                    list[index].loaiDaoTao = listDinhMuc?.map(dmItem => ({ ma: dmItem.ma, loaiDaoTao: dmItem.loaiDaoTao, soTien: dmItem.soTien }));
                }); 
            }

            const pageCondition = searchTerm;
            res.send({
                page: { totalItem: page.totalitem, pageSize: page.pagesize, pageTotal: page.pagetotal, pageNumber: page.pagenumber, pageCondition, list }
            });

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

    app.post('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            const data = req.body.data;
            let  tcDinhMuc = await app.model.tcDinhMucHocPhi.get({ namBatDau: data.namBatDau, namKetThuc: data.namKetThuc, hocKy: data.hocKy, loaiPhi: data.loaiPhi });
            if (tcDinhMuc) {
                res.send({ error: 'Định mức đã tồn tại' });
            } else {
                let items = [];

                for(let index = 0;index < data.loaiDaoTao.length; index++) {
                    let newData = {
                        namBatDau: data.namBatDau,
                        namKetThuc: data.namKetThuc,
                        hocKy: data.hocKy,
                        soTienMacDinh: data.soTienMacDinh,
                        loaiPhi: data.loaiPhi,
                        loaiDaoTao: data.loaiDaoTao[index].loaiDaoTao,
                        soTien: data.loaiDaoTao[index].soTien
                    };
                    let newItem = await app.model.tcDinhMucHocPhi.create(newData);
                    items.push(newItem);
                }

                res.send({ items });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/finance/dinh-muc-hoc-phi', app.permission.check('tcDinhMucHocPhi:write'), async (req, res) => {
        try {
            const changes = req.body.changes;
            let items = [];

            for(let index = 0;index < changes.loaiDaoTao.length; index++) {
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