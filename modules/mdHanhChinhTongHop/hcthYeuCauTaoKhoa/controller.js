module.exports = app => {
    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            505: { title: 'Yêu cầu tạo khóa', link: '/user/hcth/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c' },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1057: { title: 'Yêu cầu tạo khóa', link: '/user/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c', groupIndex: 5 },
        },
    };

    app.permission.add({ name: 'hcthYeuCauTaoKhoa:read', menu: staffMenu });
    app.permission.add({ name: 'manager:write', menu: menu });
    app.get('/user/hcth/yeu-cau-tao-khoa', app.permission.check('hcthYeuCauTaoKhoa:read'), app.templates.admin);
    app.get('/user/yeu-cau-tao-khoa', app.permission.check('hcthYeuCauTaoKhoa:read'), app.templates.admin);

    app.get('/api/hcth/yeu-cau-tao-khoa/page/:pageNumber/:pageSize', app.permission.check('hcthYeuCauTaoKhoa:read'), async (req, res) => {
        try {
            res.send({ items: [] });
        } catch (error) {
            res.send({error});
        }
    });

    app.post('/api/hcth/yeu-cau-tao-khoa', app.permission.orCheck('manager:write', 'rectors:login'), async (req, res) => {
        try{
            const data = req.body;
            const shcc = req.session.user.shcc;
            app.model.hcthYeuCauTaoKhoa.create({data})
        } catch (error) {
            res.send({error});
        }
        
    })
}