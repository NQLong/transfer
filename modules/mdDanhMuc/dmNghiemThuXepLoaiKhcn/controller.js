module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4054: { title: 'Nghiệm thu xếp loại KHCN', link: '/user/danh-muc/nghiem-thu-xep-loai-khcn' },
        },
    };
    app.permission.add(
        { name: 'dmNghiemThuXepLoaiKhcn:read', menu },
        { name: 'dmNghiemThuXepLoaiKhcn:write' },
        { name: 'dmNghiemThuXepLoaiKhcn:delete' },
    );
    app.get('/user/danh-muc/nghiem-thu-xep-loai-khcn', app.permission.check('dmNghiemThuXepLoaiKhcn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nghiem-thu-xep-loai-khcn/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmNghiemThuXepLoaiKhcn.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nghiem-thu-xep-loai-khcn/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNghiemThuXepLoaiKhcn.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nghiem-thu-xep-loai-khcn/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNghiemThuXepLoaiKhcn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nghiem-thu-xep-loai-khcn', app.permission.check('dmNghiemThuXepLoaiKhcn:write'), (req, res) => {
        app.model.dmNghiemThuXepLoaiKhcn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nghiem-thu-xep-loai-khcn', app.permission.check('dmNghiemThuXepLoaiKhcn:write'), (req, res) => {
        app.model.dmNghiemThuXepLoaiKhcn.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nghiem-thu-xep-loai-khcn', app.permission.check('dmNghiemThuXepLoaiKhcn:delete'), (req, res) => {
        app.model.dmNghiemThuXepLoaiKhcn.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};