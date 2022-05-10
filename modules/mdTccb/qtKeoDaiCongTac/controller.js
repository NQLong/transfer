module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3035: { title: 'Quá trình kéo dài công tác', link: '/user/tccb/qua-trinh/keo-dai-cong-tac', icon: 'fa-hourglass-start', backgroundColor: '#9e4d4d', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1007: { title: 'Kéo dài công tác', link: '/user/keo-dai-cong-tac', icon: 'fa-hourglass-start', color: '#000000', backgroundColor: '#eab676', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtKeoDaiCongTac:read', menu },
        { name: 'qtKeoDaiCongTac:write' },
        { name: 'qtKeoDaiCongTac:delete' },
    );
    app.get('/user/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('qtKeoDaiCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc', app.permission.check('qtKeoDaiCongTac:read'), app.templates.admin);
    app.get('/user/keo-dai-cong-tac', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtKeoDaiCongTac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKeoDaiCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtKeoDaiCongTac.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKeoDaiCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtKeoDaiCongTac.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/keo-dai-cong-tac/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });
    ///END USER ACTIONS

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/page/:pageNumber/:pageSize', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/group/page/:pageNumber/:pageSize', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });
    app.post('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKeoDaiCongTac.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKeoDaiCongTac.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKeoDaiCongTac.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/tccb/qua-trinh/keo-dai-cong-tac/multiple', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        const listData = req.body.listData, errorList = [];
        const solve = (index = 0) => {
            if (index == listData.length) {
                res.send({ error: errorList });
                return;
            }
            const item = listData[index];
            const data = {
                shcc: item.shcc,
                batDau: item.batDau,
                batDauType: item.batDauType,
                ketThuc: item.ketThuc,
                ketThucType: item.ketThucType,
            };
            app.model.qtKeoDaiCongTac.create(data, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/get-list-year', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const yearCalc = req.query.year;
        const firstYear = new Date(yearCalc, 0, 1, 0, 0, 0, 0);
        const endYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
        app.model.canBo.getAll({
            statement: 'ngayNghi IS NULL',
            parameter: {}
        }, (error, data) => {
            if (error) {
                res.send({ error, items: null });
                return;
            } 
            let items = [];
            const solve = (index = 0) => {
                if (index >= data.length) {
                    res.send({ error: null, items });
                    return;
                }
                const item = data[index];
                app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, data) => {
                    if (data && (data.resultDate.getFullYear() <= yearCalc)) {
                        let canExtend = item.chucDanh == '01' ? 10 : item.chucDanh == '02' ? 7 : (item.hocVi == '01' || item.hocVi == '02') ? 5 : 0;
                        let tenChucDanh = '', tenHocVi = '';
                        app.model.dmChucDanhKhoaHoc.get({ ma: item.chucDanh }, (error, itemCD) => {
                            app.model.dmTrinhDo.get({ ma: item.hocVi }, (error, itemHV) => {
                                if (itemCD) tenChucDanh = itemCD.ten;
                                if (itemHV) tenHocVi = itemHV.ten;
                                let start = new Date(data.resultDate);
                                let end = new Date(data.prevResultDate);
                                end.setFullYear(end.getFullYear() + canExtend);
                                if (start.getFullYear() < yearCalc) start = firstYear;
                                if (end.getFullYear() != yearCalc) end = endYear;
        
                                let dataAdd = {
                                    shcc: item.shcc,
                                    hoCanBo: item.ho,
                                    tenCanBo: item.ten,
                                    tenChucDanh,
                                    tenHocVi,
                                    batDau: start.getTime(),
                                    ketThuc: end.getTime(),
                                    batDauType: 'dd/mm/yyyy',
                                    ketThucType: 'dd/mm/yyyy',
                                    ngayNghiHuu: data.resultDate,
                                    ngaySinh: item.ngaySinh,
                                    phai: item.phai,
                                };
                                items.push(dataAdd);
                                solve(index + 1);
                            });
                        });
                    } else solve(index + 1);
                });
            };
            solve();
        });
    });
};