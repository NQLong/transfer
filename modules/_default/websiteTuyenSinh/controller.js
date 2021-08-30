module.exports = app => {
    const menuTuyenSinh = {
        parentMenu: { index: 7000, title: 'Tuyển sinh', icon: 'fa-file' },
        menus: {
            7001: { title: 'Bài viết', link: '/user/news/admission' },
            7002: { title: 'Chờ duyệt bài viết', link: '/user/news/draft-admission' },
            7003: { title: 'Sự kiện', link: '/user/event/admission' },
            // 7004: { title: 'Chờ duyệt sự kiện', link: '/user/event/draft-admission' },

        },
    };
    app.permission.add(
        { name: 'news:tuyensinh', menu: menuTuyenSinh },
    );

    app.get('/user/news/admission', app.permission.check('news:tuyensinh'), app.templates.admin);
    app.get('/user/event/admission', app.permission.check('news:tuyensinh'), app.templates.admin);
    app.get('/user/news/draft-admission', app.permission.check('news:tuyensinh'), app.templates.admin);
    app.get('/user/event/draft-admission', app.permission.check('news:tuyensinh'), app.templates.admin);

    app.get('/api/draft-admission/page/:pageNumber/:pageSize', app.permission.check('news:tuyensinh'), (req, res) => {
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
        app.model.dmDonVi.getAll((error, items) => {
            if (!error && items) {
                let dmDonViMapper = {};
                items.forEach(item => dmDonViMapper[item.ma] = item.ten);
                app.model.fwDraft.getPage(pageNumber, pageSize, condition, '*', 'lastModified DESC', (error, page) => {
                    const response = {};
                    if (error || page == null) {
                        response.error = 'Danh sách bài viết không sẵn sàng!';
                    } else {
                        const condition = {
                            statement: 'title LIKE :searchText AND type LIKE :type',
                            parameter: { searchText: '%TS%', type: '%news%' }
                        }
                        app.model.fwCategory.getAll(condition, '*', 'priority DESC', (error, categories) => {
                            const categoryFilter = categories.map(item => item.id.toString());
                            let newList = [];
                            page.list.filter(item => {
                                documentJson = JSON.parse(item.documentJson);
                                const found = documentJson.categories.some(r => categoryFilter.includes(r));
                                if (found) newList.push(item);
                            })
                            let list = newList.map(item => app.clone(item, { content: null, donVi: dmDonViMapper[item.maDonVi] }));
                            let totalItem = list.length;
                            response.page = app.clone(page, { list, totalItem });
                            res.send(response);
                        });
                    }
                });
            } else {
                res.send({ error });
            }
        })
    });
};