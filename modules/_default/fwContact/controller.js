module.exports = app => {
    const menu = { parentMenu: { index: 6000, title: 'Liên hệ', icon: 'fa-dashboard', link: '/user/contact' } };
    app.permission.add(
        { name: 'contact:read', menu },
        { name: 'contact:delete' }
    );
    app.get('/user/contact', app.permission.check('contact:read'), app.templates.admin);
    app.get('/contact(.htm(l)?)?', app.templates.home);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/contact/page/:pageNumber/:pageSize', app.permission.check('contact:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        // app.model.fwContact.searchPage(pageNumber, pageSize, -1, '', (error, page) => {
        //     if (error || page == null) {
        //         res.send({ error });
        //     } else {
        //         const { totalItem, pageSize, pageTotal, pageNumber, rows: list } = page;
        //         res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        //     }
        // });
        app.model.fwContact.getPage(pageNumber, pageSize, {}, '*', 'id DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                res.send({ error });
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/api/contact/unread', app.permission.check('contact:read'), (req, res) => {
        app.model.fwContact.searchPage(1, 1000, 0, '', (error, page) => {
            res.send({ error, items: page ? page.rows : null });
        });
    });

    app.get('/api/contact/item/:id', app.permission.check('contact:read'), (req, res) => {
        if (req.params.id != null) {
            app.model.fwContact.get({ id: req.params.id }, (error, item) => {
                if (item) {
                    app.model.fwContact.update({ id: req.body.id }, { read: 1 }, () => { });
                    item.read = 1;
                    app.io.emit('contact-changed', item);
                }
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'Thông tin bạn gửi không hợp lệ!' });
        }
    });

    app.delete('/api/contact', app.permission.check('contact:delete'), (req, res) => {
        if (req.body.id != null) {
            app.model.fwContact.delete({ id: req.body.id }, error => res.send({ error }));
        } else {
            res.send({ error: 'Thông tin bạn gửi không hợp lệ!' });
        }
    });


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/contact', (req, res) => {
        const { name, subject, message, phoneNumber, email, maDonVi } = req.body.contact;
        if (name == null || subject == null || message == null) {
            res.send({ error: 'Thông tin bạn gửi không hợp lệ!' });
        } else {
            // app.model.setting.getValue(['emailContactTitle', 'emailContactText', 'emailContactHtml'], result => {
            //     let mailSubject = result.emailContactTitle.replaceAll('{name}', name).replaceAll('{title}', subject).replaceAll('{message}', message),
            //         mailText = result.emailContactText.replaceAll('{name}', name).replaceAll('{title}', subject).replaceAll('{message}', message),
            //         mailHtml = result.emailContactHtml.replaceAll('{name}', name).replaceAll('{title}', subject).replaceAll('{message}', message);
            // });

            app.model.fwContact.create({ name, email, phoneNumber, subject, message, read: 0, maDonVi, createdDate: new Date().getTime() }, (error, item) => {
                if (item) {
                    res.send({ item });
                    // app.model.setting.getValue(['emailContactTitle', 'emailContactText', 'emailContactHtml'], result => {
                    //     let mailSubject = result.emailContactTitle.replaceAll('{name}', item.name).replaceAll('{title}', item.subject).replaceAll('{message}', item.message),
                    //         mailText = result.emailContactText.replaceAll('{name}', item.name).replaceAll('{title}', item.subject).replaceAll('{message}', item.message),
                    //         mailHtml = result.emailContactHtml.replaceAll('{name}', item.name).replaceAll('{title}', item.subject).replaceAll('{message}', item.message);
                    //     app.email.sendEmail(app.data.email, app.data.emailPassword, email, [], mailSubject, mailText, mailHtml, null, result => {
                    //         if (result == 'success') {
                    //             res.send({ item });
                    //         } else {
                    //             res.send({ error: 'fails' });
                    //         }
                    //     });
                    // });
                } else {
                    res.send({ error });
                }
            });
        }
    });
};