module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3030: { title: 'Quá trình nghỉ việc', link: '/user/tccb/qua-trinh/nghi-viec', icon: 'fa-sign-out', backgroundColor: '#2a99b8', groupIndex: 4 },
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
        const { fromYear, toYear, list_shcc, list_dv, dienNghi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, dienNghi: null };
        app.model.qtNghiViec.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, dienNghi, searchTerm, (error, page) => {
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
        const { fromYear, toYear, list_shcc, list_dv, dienNghi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, dienNghi: null };
        app.model.qtNghiViec.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, dienNghi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => res.send(error)));

};