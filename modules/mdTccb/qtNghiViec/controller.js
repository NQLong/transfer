module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3030: { title: 'Cán bộ Nghỉ việc', link: '/user/tccb/qua-trinh/nghi-viec', icon: 'fa-user-times', backgroundColor: '#2a99b8', groupIndex: 0 },
        },
    };
    app.permission.add(
        { name: 'qtNghiViec:read', menu },
        { name: 'qtNghiViec:write' },
        { name: 'qtNghiViec:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-viec/:ma', app.permission.check('qtNghiViec:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-viec/group/:loaiDoiTuong/:ma', app.permission.check('qtNghiViec:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/nghi-viec/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, dienNghi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, dienNghi: null };
        app.model.qtNghiViec.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, dienNghi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-viec/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, dienNghi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, dienNghi: null };
        app.model.qtNghiViec.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, dienNghi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        app.model.qtNghiViec.create(req.body.data, (error, item) => {
            if (!error) {
                app.model.canBo.update({ shcc: item.shcc }, { daNghi: 1 }, (e) => {
                    if (e) res.send({ error: e });
                } );
            }
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Nghỉ việc');
            res.send({ error, item });
        });
    });

    app.put('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:write'), (req, res) => {
        app.model.qtNghiViec.update({ ma: req.body.ma }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghỉ việc');
            res.send({ error, item });
        });
    });

    app.delete('/api/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:delete'), (req, res) => {
        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghỉ việc');
            res.send(error);
        });
    });

};