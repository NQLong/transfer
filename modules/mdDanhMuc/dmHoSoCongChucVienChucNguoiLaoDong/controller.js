module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2027: { title: 'Hồ sơ công chức viên chức - Người lao động', link: '/user/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong' },
        },
    };
    app.permission.add(
        { name: 'dmHoSoCcvcNld:read', menu },
        { name: 'dmHoSoCcvcNld:write' },
        { name: 'dmHoSoCcvcNld:delete' },
    );
    app.get('/user/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong', app.permission.check('dmHoSoCcvcNld:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmHoSoCcvcNld.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoSoCcvcNld.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoSoCcvcNld.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong', app.permission.check('dmHoSoCcvcNld:write'), (req, res) => {
        app.model.dmHoSoCcvcNld.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong', app.permission.check('dmHoSoCcvcNld:write'), (req, res) => {
        app.model.dmHoSoCcvcNld.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong', app.permission.check('dmHoSoCcvcNld:delete'), (req, res) => {
        app.model.dmHoSoCcvcNld.get({ ma: req.body.ma }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item == null) {
                res.send({ error: 'Mã không hợp lệ!' });
            } else {
                app.model.dmHoSoCcvcNld.delete({ maCha: item.ma }, error => {
                    if (error) {
                        res.send({ error });
                    } else {
                        app.model.dmHoSoCcvcNld.delete({ ma: item.ma }, error => res.send({ error }));
                    }
                });
            }
        });
    });
};