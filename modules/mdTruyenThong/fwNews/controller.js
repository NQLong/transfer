module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6001: { title: 'Danh mục tin tức', link: '/user/news/category', groupIndex: 1, icon: 'fa-list-alt', backgroundColor: '#00b8d4', },
            6002: { title: 'Danh sách bài viết', link: '/user/news/list', groupIndex: 1, icon: 'fa-file-o', backgroundColor: '#22e5b4', },
            6003: { title: 'Chờ duyệt', link: '/user/news/draft', groupIndex: 1, icon: 'fa-file-o', backgroundColor: '#a1cc1f', },
        },
    };
    const menuTranslate = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6004: { title: 'Dịch Tiếng Anh', link: '/user/news/draft/translate', groupIndex: 1 },
        }
    };
    const menuUnit = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6005: { title: 'Danh sách bài viết', link: '/user/news/unit/list', groupIndex: 1, icon: 'fa-file-o', backgroundColor: '#a1cc1f', },
            6006: { title: 'Chờ duyệt', link: '/user/news/unit/draft', groupIndex: 1, icon: 'fa-file-o', backgroundColor: '#a1cc1f', },
            6008: { title: 'Danh sách bài viết chính thức', link: '/user/news/list', groupIndex: 1, icon: 'fa-list-alt', backgroundColor: '#00b8d4', },
        }
    };
    app.permission.add(
        { name: 'news:manage', menu },
        { name: 'news:read', menu },
        { name: 'news:write', },
        { name: 'news:draft' },
        { name: 'news:translate', menu: menuTranslate },
        { name: 'unit:read', menu: menuUnit },
        { name: 'unit:write' },
        { name: 'unit:draft' },
    );

    ['/news/item/:newsId', '/tin-tuc/:link', '/megastory/:link'].forEach(route => app.get(route, (req, res) => {
        const changeMeta = (news, data) => {
            let title, abstract;
            try {
                title = JSON.parse(news.title, true).vi; //TODO: multi languages
                abstract = JSON.parse(news.abstract, true).vi;
            } catch (e) {
                title = news.title;
                abstract = news.abstract;
            }
            data = data.replace('<title>TRƯỜNG ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐHQG TP.HCM</title>',
                `<title>${(title || '').replaceAll('\'', '')}</title>
                <meta property='og:url' content='${app.rootUrl + req.originalUrl}' />
                <meta property='og:type' content='article' />
                <meta property="og:image:height" content="470">
                <meta property="og:image:width" content="619">
                <meta property='og:title' content='${(title || '').replaceAll('\'', '')}' />
                <meta property='og:description' content='${(abstract || '').replaceAll('\'', '')}' />
                <meta property='og:image' content='${app.rootUrl + news.image}' />
                <meta property='donVi' content=${news.maDonVi > 0 ? news.maDonVi : '00'} />`);
            res.send(data);
        };

        let id = null, link = null;
        if (req.originalUrl.startsWith('/news/item/')) id = req.originalUrl.substring('/news/item/'.length).split('?')[0];
        if (req.originalUrl.startsWith('/tin-tuc/')) link = req.originalUrl.substring('/tin-tuc/'.length).split('?')[0];
        if (req.originalUrl.startsWith('/megastory/')) link = req.originalUrl.substring('/megastory/'.length).split('?')[0];
        app.model.fwNews.get(id ? { id } : { link }, (error, item) => {
            if (error || !item) {
                app.templates.home(req, res);
            } else if (item.maDonVi == 0) {
                app.templates.home(req, { send: (data) => changeMeta(item, data) });
            } else {
                app.templates.unit(req, { send: (data) => changeMeta(item, data) });
            }
        });
    }));

    ['/news-en/item/:newsId', '/article/:link'].forEach(route => app.get(route, (req, res) => {
        const changeMeta = (news, data) => {
            let title, abstract;
            try {
                title = JSON.parse(news.title, true).en;
                abstract = JSON.parse(news.abstract, true).en;
            } catch (e) {
                title = news.title;
                abstract = news.abstract;
            }
            data = data.replace('<title>TRƯỜNG ĐẠI HỌC KHOA HỌC XÃ HỘI VÀ NHÂN VĂN - ĐHQG TP.HCM</title>',
                `<title>${(title || '').replaceAll('\'', '')}</title>
            <meta property='og:url' content='${app.rootUrl + req.originalUrl}' />
            <meta property='og:type' content='article' />
            <meta property="og:image:height" content="470">
            <meta property="og:image:width" content="619">
            <meta property='og:title' content='${(title || '').replaceAll('\'', '')}' />
            <meta property='og:description' content='${(abstract || '').replaceAll('\'', '')}' />
            <meta property='og:image' content='${app.rootUrl + news.image}' />
            <meta property='donVi' content=${news.maDonVi > 0 ? news.maDonVi : '67'} />`);
            res.send(data);
        };

        let id = null, link = null;
        if (req.originalUrl.startsWith('/news-en/item/')) id = req.originalUrl.substring('/news-en/item/'.length).split('?')[0];
        if (req.originalUrl.startsWith('/article/')) link = req.originalUrl.substring('/article/'.length).split('?')[0];

        app.model.fwNews.get(id ? { id } : { link }, (error, item) => {
            if (error || !item) {
                app.templates.home(req, res);
            } else {
                if (item && item.language == 'vi' && item.isTranslate == 0) {
                    res.redirect('/404.html');
                } else if (item.maDonVi == 0) {
                    app.templates.home(req, { send: (data) => changeMeta(item, data) });
                } else {
                    app.templates.unit(req, { send: (data) => changeMeta(item, data) });
                }
            }
        });
    }));

    app.get('/user/news/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/news/list', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/edit/:id', app.templates.admin);// TODO
    app.get('/user/news/draft', app.permission.check('news:draft'), app.templates.admin);
    app.get('/user/news/draft/edit/:id', app.permission.check('news:draft'), app.templates.admin);
    app.get('/user/news/unit/list', app.permission.check('unit:draft'), app.templates.admin);
    app.get('/user/news/unit/edit/:id', app.permission.check('unit:draft'), app.templates.admin);
    app.get('/user/news/unit/draft', app.permission.check('unit:read'), app.templates.admin);
    app.get('/user/news/unit/draft/edit/:id', app.permission.check('unit:draft'), app.templates.admin);
    app.get('/user/news/draft/translate', app.permission.check('news:draft'), app.templates.admin);
    app.get('/user/news/draft/translate/edit/:id', app.permission.check('news:translate'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/news/page/:pageNumber/:pageSize', app.permission.check('news:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition;
        if (condition) {
            condition = {
                statement: 'title LIKE :searchText',
                parameter: { searchText: `%${condition}%` }
            };
        } else {
            condition = {};
            const permissions = req.session.user && req.session.user.permissions ? req.session.user.permissions : [];
            if (permissions.includes('news:manage')) {
                condition.maDonVi = '0';
            }
        }
        app.model.fwNews.getPage(pageNumber, pageSize, condition, '*', 'priority DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách bài viết không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/api/news-donvi/page/:pageNumber/:pageSize', app.permission.check('website:read'), async (req, res) => {
        try {
            let pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize), condition = req.query.condition;
            const pageCondition = { statement: '', parameter: {} }, permissions = req.session.user.permissions;
            let donViConditionText = '', maDonVi = '';
            if (condition) {
                if (condition.searchText) {
                    pageCondition.statement += 'lower(title) LIKE :searchText';
                    pageCondition.parameter.searchText = `%${condition.searchText.toLowerCase()}%`;
                }
                if (condition.maDonVi && permissions.includes('website:manage')) {
                    donViConditionText = 'maDonVi LIKE :maDonVi';
                    maDonVi = condition.maDonVi;
                }
            }

            if (!permissions.includes('website:manage')) {
                donViConditionText = 'maDonVi LIKE :maDonVi';
                maDonVi = req.session.user.maDonVi;
            }

            if (donViConditionText) {
                pageCondition.statement += (pageCondition.statement.length ? ' AND ' : '') + donViConditionText;
                pageCondition.parameter.maDonVi = maDonVi;
            }

            const page = await app.model.fwNews.getPage(pageNumber, pageSize, pageCondition, 'id, priority, title, image, link, active, isInternal, createdDate, startPost, maDonVi, pinned', 'pinned DESC, priority DESC');
            res.send({ page });
        } catch (error) {
            res.send({ error: 'Danh sách bài viết không sẵn sàng!' });
        }
    });

    app.get('/api/news-category/page/:pageNumber/:pageSize', (req, res) => { //TODO permissions
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            categoryType = req.query.category;
        app.model.fwNews.getNewsPageWithCategory(categoryType, pageNumber, pageSize, {}, '*', 'FN.pinned DESC, FN.priority DESC', (error, page) => {
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

    app.get('/api/draft/news/:userId', app.permission.check('news:read'), (req, res) => {
        const userId = req.params.userId;
        let response = {};
        app.model.fwDraft.userGet('news', userId, (error, page) => {
            if (error) response.error = 'Danh sách mẫu tin tức không sẵn sàng!';
            res.send(page);
        });
    });

    app.get('/api/draft-news/page/:pageNumber/:pageSize', app.permission.check('news:draft'), (req, res) => {
        const user = req.session.user;
        const condition = {
            statement: 'documentType = :documentType AND maDonVi = :maDonVi',
            parameter: { documentType: 'news', maDonVi: user.maDonVi }
        };
        if (!user.permissions.includes('news:write') && !user.permissions.includes('news:draft')) {
            condition.statement += ' AND editorId = :editorId';
            condition.parameter.editorId = user.shcc;
        } else if (user.permissions.includes('news:write')) {
            condition.parameter.maDonVi = '0';
        }

        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        ['isUnitApproved', 'isDraftApproved', 'isTranslated'].forEach(element => {
            if (req.query[element] && req.query[element]['$ne']) {
                condition.statement += ` AND NOT ${element} = :${element}`;
                condition.parameter[element] = req.query[element]['$ne'];
            } else if (req.query[element] != null) {
                condition.statement += ` AND ${element} = :${element}`;
                condition.parameter[element] = req.query[element];
            }
        });
        app.model.dmDonVi.getAll((error, items) => {
            if (!error && items) {
                let dmDonViMapper = {};
                items.forEach(item => dmDonViMapper[item.ma] = item.ten);
                app.model.fwDraft.getPage(pageNumber, pageSize, condition, '*', 'lastModified DESC', (error, page) => {
                    const response = {};
                    if (error || page == null) {
                        response.error = 'Danh sách bản nháp không sẵn sàng!';
                    } else {
                        let list = page.list.map(item => app.clone(item, { content: null, donVi: dmDonViMapper[item.maDonVi] }));
                        response.page = app.clone(page, { list });
                    }
                    res.send(response);
                });
            } else {
                res.send({ error });
            }
        });
    });

    app.get('/api/unit-draft-news/page/:pageNumber/:pageSize', app.permission.check('unit:draft'), (req, res) => {
        const condition = { statement: 'documentType = :documentType', parameter: { documentType: 'news' } };
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        ['isUnitApproved', 'isDraftApproved', 'isTranslated', 'status'].forEach(element => {
            if (req.query[element] && req.query[element]['$ne']) {
                condition.statement += ` AND NOT ${element} = :${element}`;
                condition.parameter[element] = req.query[element]['$ne'];
            } else if (req.query[element] != null) {
                condition.statement += ` AND ${element} = :${element}`;
                condition.parameter[element] = req.query[element];
            }
        });

        app.model.fwDraft.getPage(pageNumber, pageSize, condition, '*', 'lastModified DESC', (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/translate-draft-news/page/:pageNumber/:pageSize', app.permission.check('news:translate'), (req, res) => {
        const condition = { statement: 'documentType = :documentType', parameter: { documentType: 'news' } };
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        ['isUnitApproved', 'isDraftApproved', 'isTranslated'].forEach(element => {
            if (req.query[element] && req.query[element]['$ne']) {
                condition.statement += ` AND NOT ${element} = :${element}`;
                condition.parameter[element] = req.query[element]['$ne'];
            } else if (req.query[element] != null) {
                condition.statement += ` AND ${element} = :${element}`;
                condition.parameter[element] = req.query[element];
            }
        });

        app.model.fwDraft.getPage(pageNumber, pageSize, condition, '*', 'lastModified DESC', (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/news/default', app.permission.check(), (req, res) => {
        const user = req.session.user, permissions = user.permissions, maDonVi = req.body.maDonVi,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh') || permissions.includes('website:write');
        if (valid) {
            const newData = {
                title: JSON.stringify({ vi: 'Tên bài viết', en: 'News title' }),
                active: 0,
                abstract: JSON.stringify({ vi: '', en: '' }),
                content: JSON.stringify({ vi: '', en: '' }),
                createdDate: new Date().getTime(),
                isTranslate: 0,
                language: 'vi'
            };

            if (permissions.includes('news:manage') || permissions.includes('website:manage')) {
                newData.maDonVi = maDonVi ? maDonVi : '0';
            } else {
                newData.maDonVi = user && user.maDonVi ? user.maDonVi : -1;
            }
            app.model.fwNews.create2(newData, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'User not has permission.' });
        }
    }
    );

    app.delete('/api/news', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write')
                || permissions.includes('news:tuyensinh') || permissions.includes('website:write');
        if (valid) {
            app.model.fwNews.delete2({ id: req.body.id }, error => res.send({ error }));
        } else {
            res.send({ error: 'User not has permission.' });
        }
    });

    app.post('/api/news/draft', app.permission.check('news:draft'), (req, res) => {
        const user = req.session.user;
        req.body.maDonVi = user.maDonVi;
        app.model.fwDraft.create2(req.body, (error, item) => res.send({ error, item }));
    });

    app.post('/api/news/unit/draft', app.permission.check('unit:draft'), (req, res) => {
        const user = req.session.user;
        req.body.maDonVi = user.maDonVi;
        app.model.fwDraft.create2(req.body, (error, item) => res.send({ error, item }));
    }
    );

    app.delete('/api/draft-news', app.permission.check('news:draft'), (req, res) => app.model.fwDraft.delete2({ id: req.body.id }, error => res.send({ error })));

    app.delete('/api/unit-draft-news', app.permission.check('unit:draft'), (req, res) => app.model.fwDraft.delete2({ id: req.body.id }, error => res.send({ error })));

    app.put('/api/news/swap', app.permission.check('news:read'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh');
        if (valid) {
            const isMoveUp = req.body.isMoveUp.toString() == 'true';
            app.model.fwNews.swapPriority(req.body.id, isMoveUp, error => res.send({ error }));
        } else {
            res.send({ error: 'User not has permission.' });
        }
    });

    app.put('/api/news', (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh') || permissions.includes('website:write');
        if (valid) {
            let { id, changes: { categories, ...changes } } = req.body;
            app.model.fwNews.update({ id }, changes, (error) => {
                if (error) {
                    res.send({ error });
                }
                else {
                    categories ? app.model.fwNewsCategory.delete({ newsId: id }, (error) => {
                        if (categories.indexOf('-1') === -1 && categories.length) {
                            const data = categories.map(categoryId => ({ newsId: id, categoryId }));
                            app.model.fwNewsCategory.createMany(data, error => res.send({ error }));
                        } else {
                            res.send({ error });
                        }
                    }) : res.send({ error: null });
                }
            });
        } else {
            res.send({ error: 'User not has permission.' });
        }
    });

    app.get('/api/news/item/:newsId', (req, res) => {
        let user = req.session.user, conditionCategory = { type: 'news', active: 1 };
        if (user && user.permissions && user.maDonVi &&
            !user.permissions.includes('news:write')) {
            conditionCategory.maDonVi = user.maDonVi;
        } else if (user && user.permissions.includes('news:write')) {
            conditionCategory = {
                statement: 'TYPE=:type AND ACTIVE=:active AND maDonVi IN (0,39)',
                parameter: { type: 'news', active: 1, }
            };
        }
        app.model.fwCategory.getAll(conditionCategory, '*', 'ID ASC', (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwNews.get({ id: req.params.newsId }, (error, item) => {
                    categories = categories.map(item => ({ id: item.id, text: item.title }));
                    app.model.fwNewsCategory.getAll({ newsId: req.params.newsId }, (error1, items) => {
                        if (error1) {
                            res.send({ error: error1 });
                        } else {
                            let listAttachment = [];
                            if (item) item.categories = items.map(item => item.categoryId);
                            if (item.attachment) {
                                const handleGetAttachment = (index) => {
                                    if (index == item.attachment.split(',').length) {
                                        res.send({ error, categories, item, listAttachment });
                                    } else {
                                        app.model.fwStorage.get({ id: item.attachment.split(',')[index] }, (err, itemStorage) => {
                                            if (itemStorage) listAttachment.push(itemStorage);
                                            handleGetAttachment(index + 1);
                                        });
                                    }
                                };
                                handleGetAttachment(0);
                            } else {
                                res.send({ error, categories, item });
                            }
                        }
                    });
                });
            }
        });
    });

    app.get('/api/draft-news/toNews/:draftId', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,

            valid = permissions.includes('news:write')
                || permissions.includes('news:tuyensinh')
                || permissions.includes('website:write');
        if (valid) {
            app.model.fwDraft.toNews(req.params.draftId, (error, item) => {
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'User not has permission.' });

        }

    });
    //TODO
    app.get('/api/draft-news/item/:newsId', app.permission.check('news:draft'), (req, res) => {
        app.model.fwCategory.getAll({ type: 'news', active: 1 }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwDraft.get({ id: req.params.newsId }, (error, item) => {
                    const dataItem = JSON.parse(item.documentJson);
                    if (dataItem.attachment) {
                        let listAttachment = [];
                        const handleGetAttachment = (index) => {
                            if (index == dataItem.attachment.split(',').length) {
                                res.send({
                                    error, item, listAttachment,
                                    categories: categories.map(item => ({ id: item.id, text: item.title }))
                                });
                            } else {
                                app.model.fwStorage.get({ id: dataItem.attachment.split(',')[index] }, (err, itemStorage) => {
                                    if (itemStorage) listAttachment.push(itemStorage);
                                    handleGetAttachment(index + 1);
                                });
                            }
                        };
                        handleGetAttachment(0);
                    } else {
                        res.send({
                            error, item,
                            categories: categories.map(item => ({ id: item.id, text: item.title })),
                        });
                    }
                });
            }
        });
    });

    app.get('/api/unit-draft-news/item/:newsId', app.permission.check('unit:draft'), (req, res) => {
        app.model.fwCategory.getAll({ type: 'news', active: 1 }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwDraft.get({ id: req.params.newsId }, (error, item) => {
                    const dataItem = JSON.parse(item.documentJson);
                    if (dataItem.attachment) {
                        let listAttachment = [];
                        const handleGetAttachment = (index) => {
                            if (index == dataItem.attachment.split(',').length) {
                                item.listAttachment = listAttachment;
                                res.send({
                                    error, item,
                                    categories: categories.map(item => ({ id: item.id, text: item.title })),
                                });
                            } else {
                                app.model.fwStorage.get({ id: dataItem.attachment.split(',')[index] }, (err, itemStorage) => {
                                    if (itemStorage) listAttachment.push(itemStorage);
                                    handleGetAttachment(index + 1);
                                });
                            }
                        };
                        handleGetAttachment(0);
                    } else {
                        res.send({
                            error, item,
                            categories: categories.map(item => ({ id: item.id, text: item.title })),
                        });
                    }
                });
            }
        });
    });

    app.get('/api/translate-draft-news/item/:newsId', app.permission.check('news:translate'), (req, res) => {
        app.model.fwCategory.getAll({ type: 'news', active: 1 }, (error, categories) => {
            if (error || categories == null) {
                res.send({ error: 'Lỗi khi lấy danh mục!' });
            } else {
                app.model.fwDraft.get({ id: req.params.newsId }, (error, item) => {
                    res.send({
                        error,
                        categories: categories.map(item => ({ id: item.id, text: item.title })),
                        item
                    });
                });
            }
        });
    });

    app.put('/api/draft-news', app.permission.check('news:draft'), (req, res) => {
        const user = req.session.user;
        req.body.changes.editorId = user.ma;
        app.model.fwDraft.update({ id: req.body.id }, req.body.changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/unit-draft-news', app.permission.check('unit:draft'), (req, res) => {
        const changes = req.body.changes;
        app.model.fwDraft.update({ id: req.body.id }, changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/translate-draft-news', app.permission.check('news:translate'), (req, res) => {
        app.model.fwDraft.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/news/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date().getTime(),
            user = req.session.user,
            maDonVi = req.query.maDonVi,
            language = req.query.language;

        let condition = {
            statement: 'maDonVi = :maDonVi AND active = :active AND (startPost <= :startPost )',
            parameter: { active: 1, startPost: today, maDonVi: maDonVi ? maDonVi : 0 },
        };

        if (!user) {
            condition.statement += ' AND isInternal = :isInternal';
            condition.parameter.isInternal = 0;
        }

        if (language) {
            condition.statement += ' AND languages like :languages)';
            condition.parameter.languages = `%${language}%`;
        }

        app.model.fwNews.getPage(pageNumber, pageSize, condition, '*', 'START_POST DESC', (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách bài viết không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/news/page/:pageNumber/:pageSize/:categoryType', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            today = new Date().getTime(),
            user = req.session.user,
            categoryType = parseInt(req.params.categoryType),
            language = req.query.language;

        const condition = {
            statement: 'FN.ACTIVE = :active AND (START_POST <= :today OR STOP_POST >= :today)',
            parameter: { active: 1, today }
        };

        if (!user) {
            condition.statement += ' AND IS_INTERNAL = :isInternal';
            condition.parameter.isInternal = 0;
        }

        if (language) {
            condition.statement += ' AND LANGUAGES like :languages';
            condition.parameter.languages = `%${language}%`;
        }

        app.model.fwCategory.get({ id: categoryType }, (error, category) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwNews.getNewsPageWithCategory(categoryType, pageNumber, pageSize, condition, '*', 'FN.pinned DESC, FN.startPost DESC', (error, page) => {
                    const response = {};
                    if (error || page == null) {
                        console.error('error', error);
                        response.error = 'Danh sách bài viết không sẵn sàng!';
                    } else {
                        let list = page.list.map(item => app.clone(item, { content: null }));
                        response.page = app.clone(page, { list });
                        if (category && category.title)
                            response.page.category = JSON.parse(category.title);
                    }
                    res.send(response);
                });
            }
        });
    });

    app.get('/news/item/id/:newsId', (req, res) => {
        app.model.fwNews.readById(req.params.newsId, (error, item) => {
            let listAttachment = [];
            if (item.attachment) {
                const handleGetAttachment = (index) => {
                    if (index == item.attachment.split(',').length) {
                        item.listAttachment = listAttachment;
                        res.send({ error, item });
                    } else {
                        app.model.fwStorage.get({ id: item.attachment.split(',')[index] }, (err, itemStorage) => {
                            if (itemStorage) listAttachment.push(itemStorage);
                            handleGetAttachment(index + 1);
                        });
                    }
                };
                handleGetAttachment(0);
            } else {
                res.send({ error, item });
            }
        });
    });

    app.get('/news/item/link/:newsLink', (req, res) => app.model.fwNews.readByLink(req.params.newsLink, (error, item) => {
        let listAttachment = [];
        if (item && item.attachment) {
            const handleGetAttachment = (index) => {
                if (index == item.attachment.split(',').length) {
                    item.listAttachment = listAttachment;
                    res.send({ error, item });
                } else {
                    app.model.fwStorage.get({ id: item.attachment.split(',')[index] }, (err, itemStorage) => {
                        if (itemStorage) listAttachment.push(itemStorage);
                        handleGetAttachment(index + 1);
                    });
                }
            };
            if (item) handleGetAttachment(0);
        } else {
            res.send({ error, item });
        }
    }));

    app.get('/news/item/link-en/:newsLink', (req, res) => app.model.fwNews.readByEnLink(req.params.newsLink, (error, item) => {
        let listAttachment = [];
        if (item && item.attachment) {
            const handleGetAttachment = (index) => {
                if (index == item.attachment.split(',').length) {
                    item.listAttachment = listAttachment;
                    res.send({ error, item });
                } else {
                    app.model.fwStorage.get({ id: item.attachment.split(',')[index] }, (err, itemStorage) => {
                        if (itemStorage) listAttachment.push(itemStorage);
                        handleGetAttachment(index + 1);
                    });
                }
            };
            if (item) handleGetAttachment(0);
        } else {
            res.send({ error, item });
        }
    }));

    app.put('/news/item/check-link', (req, res) => app.model.fwNews.getByLink(req.body.link, (error, item) => {
        res.send({ error: error ? 'Lỗi hệ thống' : (item == null || item.id == req.body.id) ? null : 'Link không hợp lệ' });
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(
        app.path.join(app.publicPath, '/img/draft'),
        app.path.join(app.publicPath, '/img/draft/news'),
        app.path.join(app.publicPath, '/img/news'),
        app.path.join(app.publicPath, '/img/draftNews')
    );

    app.uploadHooks.add('uploadNewsCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('news', fields, files, params, done), done));
    //TODO: lack of permission

    const uploadNewsAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('news:') && files.NewsImage && files.NewsImage.length > 0) {
            console.log('Hook: uploadNewsAvatar => news image upload');
            app.uploadComponentImage(req, 'news', app.model.fwNews, fields.userData[0].substring(5), files.NewsImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadNewsAvatar', (req, fields, files, params, done) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh') || permissions.includes('website:write');
        if (valid) {
            uploadNewsAvatar(req, fields, files, params, done);
        }
        //TODO
    }
    );

    const uploadNewsDraftAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('draftNews:') && files.NewsDraftImage && files.NewsDraftImage.length > 0) {
            console.log('Hook: uploadNewsDraftAvatar => news draft image upload');
            app.uploadComponentImage(req, 'draftNews', app.model.fwDraft, fields.userData[0].substring(10), files.NewsDraftImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadNewsDraftAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadNewsDraftAvatar(req, fields, files, params, done), done));
    //TODO: lack of permisstion

    app.fs.createFolder(app.path.join(app.publicPath, '/img/draftUnitNews'));

    const uploadUnitNewsDraftAvatar = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('draftUnitNews:') && files.UnitNewsDraftImage && files.UnitNewsDraftImage.length > 0) {
            console.log('Hook: uploadUnitNewsDraftAvatar => unit news draft image upload');
            app.uploadComponentImage(req, 'draftUnitNews', app.model.fwDraft, fields.userData[0].substring(14), files.UnitNewsDraftImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadUnitNewsDraftAvatar', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadUnitNewsDraftAvatar(req, fields, files, params, done), done, 'unit:draft'));

    // Hook ready -----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyNews', {
        ready: () => app.database.oracle.connected && app.model.fwNews,
        run: () => app.model.fwNews.count((error, numberOfNews) => {
            if (error == null) {
                numberOfNews = Number(numberOfNews);
                app.model.setting.setValue({ numberOfNews: isNaN(numberOfNews) ? 0 : numberOfNews });
            }
        }),
    });
};