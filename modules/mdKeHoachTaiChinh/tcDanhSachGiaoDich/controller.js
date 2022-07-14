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
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
    });
};