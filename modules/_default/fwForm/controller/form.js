module.exports = app => {
    const menu = {
        parentMenu: { index: 5100, title: 'Sự kiện', icon: 'fa-star' },
        menus: {
            // 5104: { title: 'Bộ câu hỏi', link: '/user/form/list' },
        }
    };
    app.permission.add(
        { name: 'form:read', menu },
        { name: 'form:write', menu },
        { name: 'form:delete', menu }
    );

    // app.get('/user/form/list', app.permission.check('form:read'), app.templates.admin);
    app.get('/user/form/edit/:id', app.permission.check('form:read'), app.templates.admin);
    app.get('/user/form/registration/:id', app.permission.check('form:read'), app.templates.admin);
    app.get('/form/registration/item/:id', app.templates.home);
    app.get('/form/detail/:formId', app.templates.home);

    //APIs --------------------------------------------------------------------------------------------------------------
    //Form --------------------------------------------------------------------------------------------------------------
    app.get('/api/form/page/:pageNumber/:pageSize', app.permission.check('form:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition ? req.query.pageCondition : {};
        app.model.fwForm.getPage(pageNumber, pageSize, pageCondition, '*', 'priority DESC', (error, page) => {
            if (error || page == null) {
                res.send({ error: 'Danh sách form không sẵn sàng!' });
            } else {
                res.send({ page });
            }
        });
    });

    app.get('/api/form/item/:id', app.permission.check('form:read'), (req, res) => {
        app.model.fwForm.get({ id: req.params.id }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/form', app.permission.check('form:write'), (req, res) => app.model.fwForm.createWithPriority(req.body.data, (error, item) => {
        res.send({ error, item })
    }));

    app.post('/api/form-duplicate/:id', app.permission.check('form:write'), (req, res) => {
        const id = req.params.id, title = req.body.title;
        app.model.fwForm.get({ id }, (error, copiedForm) => {
            if (error) {
                res.send({ error });
            } else if (!copiedForm) {
                res.send({ error: 'Invalid form id!' });
            } else {
                const copiedData = {
                    title: JSON.stringify({ vi: title, en: title }),
                    description: copiedForm.description,
                    active: 0,
                    isLocked: 0,
                    maxRegisterUsers: copiedForm.maxRegisterUsers,
                };
                // const copiedQuestions = copiedForm.questions && copiedForm.questions.length ? copiedForm.questions : [];
                app.model.fwForm.createWithPriority(copiedData, (error, newForm) => {
                    if (error || !newForm) {
                        res.send({ error: 'System has error!' });
                    } else {
                        app.model.fwQuestion.getAll({ formId: id }, (error, questions) => {
                            if (error) {
                                res.send({ error });
                            } else {
                                const newQuestions = [...questions];
                                for (const question of newQuestions) {
                                    delete question.id;
                                    question.formId = newForm.id;
                                }
                                app.model.fwQuestion.createMany(newQuestions, (error, item) => {
                                    res.send({ error, item });
                                });
                            }
                        })
                    }
                });
            }
        });
    });

    app.put('/api/form', app.permission.check('form:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.fwForm.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/form/swap', app.permission.check('form:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.fwForm.swapPriority(req.body.id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/form', app.permission.check('form:delete'), (req, res) => {
        app.model.fwEvent.update({ form: req.body.id }, { form: null }, (error) => {
            if (error)
                res.send({ error });
            else {
                app.model.fwForm.delete({ id: req.body.id }, error => {
                    if (error)
                        res.send({ error });
                    else {
                        app.model.fwQuestion.delete({ formId: req.body.id }, error => res.send({ error }));
                    }
                });
            }
        });
    });

    app.get('/api/home/form/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize),
            pageCondition = req.query.pageCondition ? req.query.pageCondition : {};
        pageCondition.active = true;
        app.model.fwForm.getPage(pageNumber, pageSize, pageCondition, (error, page) => {
            res.send({ error, page })
        });
    });

    app.get('/api/home/form/item/:id', (req, res) => {
        const condition = {
            id: req.params.id,
            active: true
        };
        app.model.fwForm.get(condition, (error, item) => res.send({ error, item, payment: req.session.payment }));
    });

    //home
    app.get('/api/home/form/item-test/:formId', app.permission.check(), (req, res) => {
        const formId = req.params.formId;
        const condition = { id: formId, active: true, isLocked: false };
        app.model.fwForm.get(condition, (error, item) => {
            if (error) {
                res.send({ error: 'System has error!' });
            } else if (!item) {
                res.send({ error: 'Invalid form id!' });
            } else {
                res.send({ error, item })
            }
        });
    });

    //Question ---------------------------------------------------------------------------------------------------------
    app.get('/api/home/questions-page/:formId/:pageNumber/:pageSize', (req, res) => {
        const formId = req.params.formId;
        const pageNumber = parseInt(req.params.pageNumber);
        const pageSize = parseInt(req.params.pageSize);
        app.model.fwQuestion.getPage(pageNumber, pageSize, { formId }, '*', 'priority DESC', (error, page) => {
            res.send({ error, page });
        });

    });

    app.get('/api/home/questions-page/all/:formId', (req, res) => {
        const formId = req.params.formId;
        app.model.fwQuestion.getAll({ formId }, '*', 'priority DESC', (error, list) => {
            res.send({ error, list });
        })
    });

    app.get('/api/questions/:formId', app.permission.check('form:read'), (req, res) => {
        const formId = req.params.formId;
        app.model.fwQuestion.getAll({ formId }, '*', 'priority DESC', (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/question/:id', app.permission.check('form:write'), (req, res) => {
        const id = req.params.id, data = req.body.data;
        data.formId = id;
        app.model.fwQuestion.createWithPriority(id, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/question', app.permission.check('form:write'), (req, res) => {
        const id = req.body.id, data = req.body.data;
        app.model.fwQuestion.update({ id }, data, (error, question) => {
            res.send({ error, question });
        });
    });

    app.put('/api/question/swap', app.permission.check('form:write'), (req, res) => {
        const { id, formId } = req.body;
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.fwQuestion.swapPriority(id, formId, isMoveUp, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/question', app.permission.check('form:write'), (req, res) => {
        const { id } = req.body;
        app.model.fwQuestion.delete({ id }, (error, _) => {
            res.send({ error });
        });
    });

    // Hook upload images ----------------------------------------------------------------------------------------------
    app.createFolder(
        app.path.join(app.publicPath, '/img/form'),
        app.path.join(app.publicPath, '/img/question')
    );

    app.uploadHooks.add('uploadFormCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('form', fields, files, params, done), done, 'form:write'));

    app.uploadHooks.add('uploadQuestionCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('question', fields, files, params, done), done, 'form:write'));

    const uploadFormImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('form:') && files.FormImage && files.FormImage.length > 0) {
            console.log('Hook: uploadFormImage => form image upload');
            app.uploadComponentImage(req, 'form', app.model.fwForm, fields.userData[0].substring(5), files.FormImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadFormImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadFormImage(req, fields, files, params, done), done, 'form:write'));
};
