module.exports = app => {
    const menu = {
        parentMenu: { index: 5000, title: 'Bài viết', icon: 'fa-file' },
        menus: { 5007: { title: 'iNews', link: '/user/inews' } },
    };

    app.permission.add(
        { name: 'inews:read', menu },
        { name: 'inews:write', menu },
        { name: 'inews:delete', menu },
    );

    app.get('/user/inews', app.permission.check('inews:read'), app.templates.admin);
    app.get('/user/inews/edit/:inewsId', app.permission.check('inews:read'), app.templates.admin);

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------

    // Send email test
    app.post('/api/inews/test', (req, res) => {
        const { mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments } = req.body;
        app.email.sendEmail(mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, () => { console.log('mail sent'); res.send({ success: true }); }, (error) => res.send({ error }));
    });

    app.get('/api/inews/page/:pageNumber/:pageSize', app.permission.check('inews:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.fwInews.getPage(pageNumber, pageSize, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/inews/item/:inewsId', app.permission.check('inews:read'), (req, res) => {
        const { inewsId } = req.params;
        app.model.fwInews.get({ id: inewsId }, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwInewsItem.getAll({ inewsId }, '*', 'priority DESC', (error, list) => {
                    if (error) {
                        res.send({ error });
                    } else {
                        res.send({ item, list });
                    }
                });
            }
        });
    });

    app.post('/api/inews', app.permission.check('inews:write'), (req, res) => {
        const changes = req.body;
        app.model.fwInews.create(changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/inews', app.permission.check('inews:write'), (req, res) => {
        const { id, ...changes } = req.body;
        app.model.fwInews.update({ id }, changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/inews', app.permission.check('inews:delete'), (req, res) => {
        const { id } = req.body;
        app.model.fwInewsItem.delete2(id, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwInews.delete({ id }, error => {
                    res.send({ error });
                });
            }
        });
    });

    app.post('/api/inewsItem', app.permission.check('inews:write'), (req, res) => {
        const changes = req.body;
        app.model.fwInewsItem.createWithPriority(changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/inewsItem', app.permission.check('inews:write'), (req, res) => {
        const { id, changes } = req.body;
        app.model.fwInewsItem.update({ id }, changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/inewsItem', app.permission.check('inews:delete'), (req, res) => {
        const { item } = req.body;
        item.type === 'image' && app.deleteImage(item.payload);
        app.model.fwInewsItem.delete({ id: item.id }, error => {
            res.send({ error });
        });
    });

    app.put('/api/inewsItem/swap', app.permission.check('inews:write'), (req, res) => {
        let { id, inewsId, isMoveUp } = req.body;
        isMoveUp = isMoveUp.toString() == 'true';
        app.model.fwInewsItem.swapPriority(id, inewsId, isMoveUp, error => res.send({ error }));
    });

    // Upload hook
    app.createFolder(app.path.join(app.publicPath, '/img/iNews'));
    const uploadINewsImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('iNews:') && files.INewsImage && files.INewsImage.length > 0) {
            console.log('Hook: uploadINewsImage => iNews image upload');
            app.uploadComponentImage(req, 'iNews', null, fields.userData[0].substring(6), files.INewsImage[0].path, done);
        }
    };

    app.uploadHooks.add('uploadINewsImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadINewsImage(req, fields, files, params, done), done, 'component:write'));
};