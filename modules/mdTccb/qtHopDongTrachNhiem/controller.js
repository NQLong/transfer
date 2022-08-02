module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3031: { title: 'Hợp đồng Trách nhiệm', link: '/user/tccb/qua-trinh/hop-dong-trach-nhiem', icon: 'fa-pencil', backgroundColor: '#00897b', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'qtHopDongTrachNhiem:read', menu },
        { name: 'qtHopDongTrachNhiem:write' },
        { name: 'qtHopDongTrachNhiem:delete' },
        { name: 'qtHopDongTrachNhiem:export' },
    );

    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem/:ma', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleQtHopDongTrachNhiem', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'qtHopDongTrachNhiem:read', 'qtHopDongTrachNhiem:write', 'qtHopDongTrachNhiem:delete', 'qtHopDongTrachNhiem:export');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/page/:pageNumber/:pageSize', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = req.query.condition || '';
        let filter = app.stringify(req.query.filter || {});
        app.model.qtHopDongTrachNhiem.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/edit/:ma', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        app.model.qtHopDongTrachNhiem.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/handle-so-hop-dong', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        let thisYear = new Date().getFullYear(),
            firstDayThisYear = new Date(`01 01 ${thisYear} 0 0 0`).getTime(),
            lastDayThisYear = new Date(`31 12 ${thisYear} 23 59 59`).getTime();
        app.model.qtHopDongTrachNhiem.getAll({
            statement: 'ngayKyHopDong >= :firstDayThisYear AND ngayKyHopDong <= :lastDayThisYear',
            parameters: { firstDayThisYear, lastDayThisYear }
        }, 'soHopDong', 'ngayKyHopDong DESC NULLS LAST', (error, items) => {
            if (error) res.send({ error });
            else {
                items = items.map(item => Number(item.soHopDong.substring(0, item.soHopDong.indexOf('/'))));
                const maxCurrent = Math.max(...items) || 0;
                res.send({ soHopDongSuggest: maxCurrent + 1 });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-trach-nhiem/edit/item/:ma', app.permission.check('qtHopDongTrachNhiem:read'), (req, res) => {
        app.model.qtHopDongTrachNhiem.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.create(req.body.item, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng trách nhiệm');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.update({ ma: req.body.ma }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng trách nhiệm');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:write'), (req, res) => {
        app.model.qtHopDongTrachNhiem.delete({ ma: req.body.ma }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng trách nhiệm');
            res.send({ error });
        });
    });
};