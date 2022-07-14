module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5005: { title: 'Tổng giao dịch', link: '/user/finance/tong-giao-dich' },
        },
    };

    app.permission.add({ name: 'tcTongGiaoDich:read', menu });
    app.get('/user/finance/tong-giao-dich', app.permission.check('tcTongGiaoDich:read'), app.templates.admin);


    app.get('/api/finance/tong-giao-dich/page/:pageNumber/:pageSize', app.permission.check('tcTongGiaoDich:read'), async (req, res) => {
        try {
            let filter = req.query.filter;
            filter = app.stringify(filter);
            const searchTerm = req.query.pageCondition;
            const page = await app.model.tcHocPhiTransaction.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), '', searchTerm, filter);
            console.log(page)
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            const pageCondition = searchTerm;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list }
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });
};