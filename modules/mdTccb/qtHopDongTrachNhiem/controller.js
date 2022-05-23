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
    );

    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem/:ma', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-trach-nhiem', app.permission.check('qtHopDongTrachNhiem:read'), app.templates.admin);

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
        const ma = req.params.ma;
        app.model.qtHopDongTrachNhiem.get({ ma }, (error, hopDong) => {
            if (error || hopDong == null) {
                res.send({ error });
            } else {
                app.model.canBo.get({ shcc: hopDong.nguoiKy }, (error, nguoiKy) => {
                    app.model.canBo.get({ shcc: hopDong.nguoiDuocThue }, (error, nguoiDuocThue) => {
                        res.send({ error, item: { nguoiDuocThue, nguoiKy, hopDong } });
                    });
                });
            }
        });
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

};