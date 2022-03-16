module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            5101: { title: 'Danh mục sự kiện', link: '/user/event/category', groupIndex: 2, icon: 'fa-list-alt', backgroundColor: '#00b8d4', },
            5102: { title: 'Danh sách sự kiện', link: '/user/event/list', groupIndex: 2, icon: 'fa-file-o', backgroundColor: '#22e5b4' },
            5103: { title: 'Chờ duyệt', link: '/user/event/draft', groupIndex: 2, icon: 'fa-file-o', backgroundColor: '#a1cc1f', },
        },
    };
    app.permission.add(
        { name: 'event:manage', menu },
        { name: 'event:read', menu },
        { name: 'event:write', menu },
        { name: 'event:registration', menu },
        { name: 'event:roller', menu },
        { name: 'event:import', menu },
        { name: 'event:export', menu },
        { name: 'event:draft', menu },
    );

    ['/event/item/:eventId', '/su-kien/:link', '/event/registration/item/:eventId', '/su-kien/dangky/:link', '/event/list'].forEach(route => app.get(route, app.templates.home));
    app.get('/user/event/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/event/list', app.permission.check('event:read'), app.templates.admin);
    app.get('/user/event/edit/:id', app.templates.admin); // TODO
    app.get('/user/event/registration/:id', app.permission.check('event:read'), app.templates.admin);
    app.get('/user/event/draft', app.permission.check('event:draft'), app.templates.admin);
    app.get('/user/event/draft/edit/:id', app.permission.check('event:draft'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/event/page/:pageNumber/:pageSize', (req, res) => {//TODO
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            if (typeof (req.query.condition) == 'object') {
                if (req.query.condition.searchText) {
                    condition = {
                        statement: 'title LIKE :searchText ',
                        parameter: { searchText: `%${req.query.condition.searchText}%` }
                    };
                }
            } else {
                condition = {
                    statement: 'title LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition}%` }
                };
            }
        }
        const permissions = req.session.user && req.session.user.permissions,
            user = req.session.user;
        if (permissions.includes('website:write') && !permissions.includes('event:write')) {
            condition.maDonVi = user.maDonVi;
            delete condition.condition;
        }
        app.model.fwEvent.getPage(pageNumber, pageSize, condition, '*', 'priority DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách sự kiện không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/api/event-category/page/:pageNumber/:pageSize', app.permission.check('news:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            categoryType = req.query.category;
        app.model.fwEvent.getEventPageWithCategory(categoryType, pageNumber, pageSize, {}, '*', 'priority DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                console.error('error', error);
                response.error = 'Danh sách bài viết không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/event/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date().getTime(),
            user = req.session.user,
            categoryType = parseInt(req.params.categoryType),
            language = req.query.language;

        const condition = {
            statement: 'FN.ACTIVE = :active AND (START_POST <= :today )',
            parameter: { active: 1, today }
        };
        if (!user) {
            condition.statement += ' AND IS_INTERNAL = :isInternal';
            condition.parameter.isInternal = 0;
        }
        if (language == 'en') {
            condition.statement += ' AND (IS_TRANSLATE =1 OR (IS_TRANSLATE =0 AND LANGUAGE=\'en\'))';
        } else {
            condition.statement += ' AND (IS_TRANSLATE =1 OR (IS_TRANSLATE =0 AND LANGUAGE=\'vi\'))';
        }
        app.model.fwCategory.get({ id: categoryType }, (error, category) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwEvent.getEventPageWithCategory(categoryType, pageNumber, pageSize, condition, '*', 'priority DESC', (error, page) => {
                    const response = {};
                    if (error || page == null) {
                        console.error('error', error);
                        response.error = 'Danh sách bài viết không sẵn sàng!';
                    } else {
                        let list = page.list.map(item => app.clone(item, { content: null }));
                        response.page = app.clone(page, { list });
                        response.page.category = JSON.parse(category.title);
                    }
                    res.send(response);
                });
            }
        });
    });


    app.put('/api/event/swap', app.permission.check('event:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.fwEvent.swapPriority(req.body.id, isMoveUp, error => res.send({ error }));
    });

    app.get('/api/draft/event/:userId', app.permission.check('event:read'), (req, res) => {
        const userId = req.params.userId;
        app.model.fwDraft.userGet('event', userId, (error, page) => {
            const response = {};
            if (error) response.error = 'Danh sách mẫu sự kiện không sẵn sàng!';
            res.send(page);
        });
    });

    app.get('/api/draft-event/page/:pageNumber/:pageSize', app.permission.check('event:draft'), (req, res) => {
        const user = req.session.user;
        const condition = { documentType: 'event' };
        if (!user.permissions.includes('news:write')) {
            condition.editorId = user.shcc;
        }
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);

        app.model.fwDraft.getPage(pageNumber, pageSize, condition, '*', 'lastModified DESC', (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/event/default', (req, res) => {
        const permissions = req.session.user.permissions;
        if (permissions.includes('event:write') || permissions.includes('website:write')) {
            let newDate = new Date().getTime(),
                maDonVi = permissions.includes('news:write') ? '0' : req.session.user.maDonVi;
            app.model.fwEvent.create2(
                {
                    title: JSON.stringify({ vi: 'Sự kiện', en: 'Event' }),
                    active: 0,
                    isInternal: 0,
                    createdDate: newDate,
                    startPost: newDate,
                    startRegister: newDate,
                    startEvent: newDate,
                    maDonVi,
                    abstract: JSON.stringify({ vi: '', en: '' })
                }, (error, item) => {
                    res.send({ error, item });
                });
        } else {
            res.send({ error: 'Bugs' });
        }
    });

    app.put('/api/event', (req, res) => {
        const permissions = req.session.user.permissions;
        if (permissions && permissions.includes('event:write')
            || permissions && permissions.includes('website:write')) {
            let { id, changes: { categories, ...changes } } = req.body;

            app.model.fwEvent.update({ id }, changes, (error) => {
                if (error) {
                    res.send({ error });
                }
                else {
                    categories ? app.model.fwEventCategory.delete({ eventId: id }, (error) => {
                        if (categories.indexOf('-1') === -1 && categories.length) {
                            const data = categories.map(categoryId => ({ eventId: id, categoryId }));
                            app.model.fwEventCategory.createMany(data, error => res.send({ error }));
                        } else
                            res.send({ error });
                    }) : res.send({ error: null });
                }
            });
        } else {
            res.send({ error: 'you do not have permission' });
        }

    });

    app.post('/api/event/draft', app.permission.check('event:draft'), (req, res) => app.model.fwDraft.create2(req.body, (error, item) => res.send({ error, item })));

    app.delete('/api/draft-event', app.permission.check('event:draft'), (req, res) => app.model.fwDraft.delete2({ id: req.body.id }, error => res.send({ error })));

    app.delete('/api/event', app.permission.check('staff:login'), (req, res) => {
        let permissions = req.session.user.permissions;
        if (permissions.includes('event:write') || permissions.includes('website:write')) {
            app.model.fwEvent.delete2({ id: req.body.id }, error => res.send({ error }));
        } else {
            res.send({ error: 'you do not have permission' });
        }
    });

    app.get('/api/draft-event/toEvent/:eventId', app.permission.check('event:write'), (req, res) => app.model.fwDraft.toEvent(req.params.eventId, (error, item) => res.send({ error, item })));

    app.put('/api/draft-event', app.permission.check('event:draft'), (req, res) =>
        app.model.fwDraft.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.get('/api/event/item/:eventId', (req, res) => {
        let user = req.session.user, condition = { type: 'event', active: 1 };
        if (user.permissions.includes('website:write') && !user.permissions.includes('event:write')) {
            condition.maDonVi = user.maDonVi;
        }

        app.model.fwCategory.getAll(condition, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwEvent.get({ id: req.params.eventId }, (error, item) => {
                    categories = categories.map(item => ({ id: item.id, text: item.title }));
                    app.model.fwEventCategory.getAll({ eventId: req.params.eventId }, (error1, items) => {
                        if (error1) res.send({ error: error1 });
                        item.categories = items.map(item => item.categoryId);
                        res.send({ error, categories, item });
                    });
                });
            }
        });
    });
    app.get('/api/draft-event/item/:eventId', app.permission.check('event:draft'), (req, res) => {
        app.model.fwCategory.getAll({ type: 'event', active: 1 }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwDraft.get({ id: req.params.eventId }, (error, item) => {
                    res.send({
                        error, categories: categories.map(item => ({ id: item.id, text: item.title })), item
                    });
                });
            }
        });
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/event/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date().getTime(),
            user = req.session.user;

        const condition = {
            statement: 'ACTIVE = :active AND (START_POST <= :startPost OR STOP_POST >= :stopPost)',
            parameter: { active: 1, startPost: today, stopPost: today }
        };

        if (!user) {
            condition.statement += ' AND IS_INTERNAL = :isInternal';
            condition.parameter.isInternal = 0;
        }

        app.model.fwEvent.getPage(pageNumber, pageSize, condition, '*', 'priority DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách sự kiện không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/event/item/id/:eventId', (req, res) => app.model.fwEvent.readById(req.params.eventId, (error, item) => {
        res.send({ error, item });
    }));
    app.get('/event/item/link/:link', (req, res) => app.model.fwEvent.readByLink(req.params.link, (error, item) => {
        res.send({ error, item });
    }));

    app.put('/event/item/check-link', (req, res) => app.model.fwEvent.getByLink(req.body.link, (error, item) => {
        res.send({
            error: error ? 'Lỗi hệ thống' : (item == null || item.id == req.body.id) ? null : 'Link không hợp lệ'
        });
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(
        app.path.join(app.publicPath, '/img/draft'),
        app.path.join(app.publicPath, '/img/draft/event'),
        app.path.join(app.publicPath, '/img/event'),
        app.path.join(app.publicPath, '/img/draftEvent')
    );

    const uploadEventCkEditor = (req, fields, files, params, done) => {
        if (files.upload && files.upload.length > 0 && fields.ckCsrfToken && params.Type == 'File' && params.category == 'event') {
            console.log('Hook: uploadEventCkEditor => ckEditor upload');

            const srcPath = files.upload[0].path;
            app.jimp.read(srcPath).then(image => {
                app.fs.unlinkSync(srcPath);

                if (image) {
                    if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                    const url = '/img/event/' + app.path.basename(srcPath);
                    image.write(app.path.join(app.publicPath, url), error => {
                        done({ uploaded: error == null, url, error: { message: error ? 'Upload has errors!' : '' } });
                    });
                } else {
                    done({ uploaded: false, error: 'Upload has errors!' });
                }
            });
        } else {
            done();
        }
    };
    app.uploadHooks.add('uploadEventCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadEventCkEditor(req, fields, files, params, done), done));
    //TODO:lack of permission

    const uploadEventAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('event:') && files.EventImage && files.EventImage.length > 0) {
            console.log('Hook: uploadEventAvatar => event image upload');
            app.uploadComponentImage(req, 'event', app.model.fwEvent, fields.userData[0].substring(6), files.EventImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadEventAvatar', (req, fields, files, params, done) =>
        // app.permission.has(req, () => uploadEventAvatar(req, fields, files, params, done), done, 'event:write')
        app.permission.has(req, () => uploadEventAvatar(req, fields, files, params, done), done, 'staff:login')

    );
    const uploadEventDraftAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('event:') && files.EventDraftImage && files.EventDraftImage.length > 0) {
            console.log('Hook: uploadEventDraftAvatar => event draft image upload');
            app.uploadComponentImage(req, 'draftEvent', app.model.fwDraft, fields.userData[0].substring(6), files.EventDraftImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadEventDraftAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadEventDraftAvatar(req, fields, files, params, done), done, 'event:draft'));


    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyEvent', {
        ready: () => app.dbConnection != null && app.model != null && app.model.fwEvent != null,
        run: () => app.model.fwEvent.count((error, numberOfEvent) => {
            numberOfEvent = Number(numberOfEvent);
            app.model.setting.setValue({ numberOfEvent: isNaN(numberOfEvent) ? 0 : numberOfEvent });
        }),
    });
};