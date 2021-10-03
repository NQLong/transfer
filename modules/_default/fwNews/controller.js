module.exports = app => {
    const menu = {
        parentMenu: { index: 5000, title: 'Bài viết', icon: 'fa-file' },
        menus: {
            5001: { title: 'Danh mục', link: '/user/news/category' },
            5002: { title: 'Danh sách bài viết', link: '/user/news/list' },
            5003: { title: 'Chờ duyệt', link: '/user/news/draft' },
        },
    };
    const menuTranslate = {
        parentMenu: { index: 5000, title: 'Bài viết', icon: 'fa-file' },
        menus: {
            5004: { title: 'Dịch Tiếng Anh', link: '/user/news/draft/translate' },
        }
    };
    const menuUnit = {
        parentMenu: { index: 5000, title: 'Bài viết', icon: 'fa-file' },
        menus: {
            5005: { title: 'Danh sách bài viết', link: '/user/news/unit/list' },
            5006: { title: 'Chờ duyệt', link: '/user/news/unit/draft' },
            5008: { title: 'Danh sách bài viết chính thức', link: '/user/news/list' },
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

    ['/news/item/:newsId', '/tin-tuc/:link'].forEach(route => app.get(route, (req, res) => {
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
                <meta property='donVi' content=${news.maDonVi} />`);
            res.send(data);
        };
        new Promise(resolve => {
            if (req.originalUrl.startsWith('/news/item/')) {
                const idNews = req.originalUrl.substring('/news/item/'.length).split('?')[0];
                app.model.fwNews.get({ id: idNews }, (error, item) => resolve(item));
            } else {
                resolve(null);
            }
        }).then(news => new Promise(resolve => {
            if (news) {
                resolve(news);
            } else if (req.originalUrl.startsWith('/tin-tuc/')) {
                const idNews = req.originalUrl.substring('/tin-tuc/'.length).split('?')[0];
                app.model.fwNews.getByLink(idNews, (error, item) => resolve(item));
            } else {
                resolve(null);
            }
        })).then(news => {
            if (news && news.maDonVi == 0) app.templates.home(req, { send: (data) => changeMeta(news, data) });
            else if (news) app.templates.unit(req, { send: (data) => changeMeta(news, data) });
            else {
                console.log(route, 'bugs');
                res.redirect('/404.html');
            }
        });
    }));

    ['/news-en/item/:newsId'].forEach(route => app.get(route, (req, res) => {
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
            <meta property='donVi' content='67' />`);
            res.send(data);
        };
        new Promise(resolve => {
            if (req.originalUrl.startsWith('/news-en/item/')) {
                const idNews = req.originalUrl.substring('/news-en/item/'.length).split('?')[0];
                app.model.fwNews.get({ id: idNews }, (error, item) => resolve(item));
            } else {
                resolve(null);
            }
        }).then(news => new Promise(resolve => {
            if (news) {
                resolve(news);
            } else if (req.originalUrl.startsWith('/tin-tuc/')) {
                const idNews = req.originalUrl.substring('/tin-tuc/'.length).split('?')[0];
                app.model.fwNews.getByLink(idNews, (error, item) => resolve(item));
            } else {
                resolve(null);
            }
        })).then(news => {
            if (news && news.language == 'vi' && news.isTranslate == 0) { res.redirect('/404.html'); }
            // else if (news && news.maDonVi == 0) app.templates.home(req, { send: (data) => changeMeta(news, data) });
            else if (news) app.templates.unit(req, { send: (data) => changeMeta(news, data) });
            else {
                console.log(route, 'bugs');
                res.redirect('/404.html');
            }
        });
    }));

    app.get('/user/news/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/news/list', app.permission.check('news:read'), app.templates.admin);
    app.get('/user/news/edit/:id', app.templates.admin);// TODO
    app.get('/user/news/draft', app.permission.check('news:read'), app.templates.admin);
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

    app.get('/api/news-donvi/page/:pageNumber/:pageSize', app.permission.check('website:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition;
        if (condition) {
            condition = {
                statement: 'title LIKE :searchText',
                parameter: { searchText: `%${condition}%` }
            };
        } else if (req.session.user && req.session.user.maDonVi) {
            condition = { maDonVi: req.session.user.maDonVi };
        }
        app.model.fwNews.getPage(pageNumber, pageSize, condition, '*', 'pinned DESC, priority DESC', (error, page) => {
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

    app.get('/api/news-category/page/:pageNumber/:pageSize', (req, res) => {//TODO permissions
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
        const condition = { statement: 'documentType = :documentType', parameter: { documentType: 'news' } };
        if (!user.permissions.includes('news:write') && !user.permissions.includes('news:draft')) {
            condition.statement += ' AND editorId = :editorId';
            condition.parameter.editorId = user.shcc;
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
                        response.error = 'Danh sách bài viết không sẵn sàng!';
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

    app.post('/api/news/default', (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh') || permissions.includes('website:write');
        if (valid) {
            app.model.fwNews.create2({
                title: JSON.stringify({ vi: 'Tên bài viết', en: 'News title' }),
                active: 0,
                abstract: JSON.stringify({ vi: '', en: '' }),
                content: JSON.stringify({ vi: '', en: '' }),
                createdDate: new Date().getTime(),
                isTranslate: 0,
                language: 'vi',
                maDonVi: permissions.includes('news:manage') ? '0' : (req.session.user && req.session.user.maDonVi ?
                    req.session.user.maDonVi : -1),
            }, (error, item) => res.send({ error, item }));
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

    app.post('/api/news/draft', app.permission.check('news:draft'), (req, res) => app.model.fwDraft.create2(req.body, (error, item) => res.send({ error, item })));

    app.post('/api/news/unit/draft', app.permission.check('unit:draft'), (req, res) => {
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

    app.get('/api/draft-news/toNews/:draftId', app.permission.check('news:read'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('news:write') || permissions.includes('news:tuyensinh');
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

    app.put('/api/draft-news', app.permission.check('news:draft'), (req, res) =>
        app.model.fwDraft.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

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
            statement: 'MA_DON_VI = :maDonVi AND ACTIVE = :active AND (START_POST <= :startPost )',
            parameter: { active: 1, startPost: today, maDonVi: maDonVi ? maDonVi : 0 },
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
        console.log(condition);
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
        if (language == 'en') {
            condition.statement += ' AND (IS_TRANSLATE =1 OR (IS_TRANSLATE =0 AND LANGUAGE=\'en\'))';
        } else {
            condition.statement += ' AND (IS_TRANSLATE =1 OR (IS_TRANSLATE =0 AND LANGUAGE=\'vi\'))';
        }
        app.model.fwCategory.get({ id: categoryType }, (error, category) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwNews.getNewsPageWithCategory(categoryType, pageNumber, pageSize, condition, '*', 'FN.pinned DESC, FN.startPost DESC', (error, page) => {
                    // console.log(page);
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
    }));
    app.put('/news/item/check-link', (req, res) => app.model.fwNews.getByLink(req.body.link, (error, item) => {
        res.send({ error: error ? 'Lỗi hệ thống' : (item == null || item.id == req.body.id) ? null : 'Link không hợp lệ' });
    }));

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(
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

    app.createFolder(app.path.join(app.publicPath, '/img/draftUnitNews'));

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
        ready: () => app.dbConnection != null && app.model != null && app.model.fwNews != null,
        run: () => app.model.fwNews.count((error, numberOfNews) => app.data.numberOfNews = error ? 0 : numberOfNews.rows[0]['COUNT(*)']),
    });
};