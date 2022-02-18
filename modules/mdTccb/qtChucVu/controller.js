module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3004: { title: 'Quá trình chức vụ', link: '/user/tccb/qua-trinh/chuc-vu', icon: 'fa-black-tie', backgroundColor: '#c77a2e', color: 'black', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'qtChucVu:read', menu },
        { name: 'qtChucVu:write' },
        { name: 'qtChucVu:delete' },
    );
    app.get('/user/tccb/qua-trinh/chuc-vu/:stt', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/chuc-vu/group/:shcc', app.permission.check('qtChucVu:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/qua-trinh/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0};
        app.model.qtChucVu.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/group/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtChucVu.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
        app.model.qtChucVu.getByShcc(req.query.shcc, (error, items) => res.send({ error, items }));
    });


    // app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
    //     app.model.qtChucVu.getAll((error, items) => res.send({ error, items }));
    // });

    app.post('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) => {
        app.model.qtChucVu.create(req.body.data, (error, item) => res.send({ error, item }));
    });
    

    app.put('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.update({ stt: req.body.stt }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error)));

    // app.post('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.body.data && req.session.user) {
    //         const data = req.body.data;
    //         app.model.qtChucVu.create(data, (error, item) => res.send({ error, item }));
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    // app.put('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.body.changes && req.session.user) {
    //         app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
    //             if (error || item == null) {
    //                 res.send({ error: 'Not found!' });
    //             } else {
    //                 if (item.email === req.session.user.email) {
    //                     const changes = req.body.changes;
    //                     app.model.qtChucVu.update({ stt: req.body.stt }, changes, (error, item) => res.send({ error, item }));
    //                 } else {
    //                     res.send({ error: 'Not found!' });
    //                 }
    //             }
    //         });
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    // app.delete('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
    //     if (req.session.user) {
    //         app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
    //             if (error || item == null) {
    //                 res.send({ error: 'Not found!' });
    //             } else {
    //                 if (item.email === req.session.user.email) {
    //                     app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error));
    //                 } else {
    //                     res.send({ error: 'Not found!' });
    //                 }
    //             }
    //         });
    //     } else {
    //         res.send({ error: 'Invalstt parameter!' });
    //     }
    // });

    app.get('/api/tccb/qua-trinh/chuc-vu-by-shcc/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtChucVu.getByShcc(req.params.shcc, (error, item) => {
            if (item && item.rows.length > 0) res.send({ error, item: item.rows });
        });
    });
};