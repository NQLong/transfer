module.exports = app => {
    app.permission.add(
        { name: 'category:read' },
        { name: 'category:write' },
    );
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/category/:type', (req, res) => {
        let condition = req.query.condition;
        if (condition) {
            condition = {
                statement: 'title LIKE :searchText AND type LIKE :type',
                parameter: { searchText: `%${condition}%`, type: `%${req.params.type}%` }
            };
        } else {
            condition = { type: req.params.type };
            const user = req.session.user;
            if (user && user.maDonVi && user.permissions.includes('website:read') && !user.permissions.includes('news:write')) {
                condition.maDonVi = user.maDonVi;
            } else if (user && user.permissions.includes('website:write')) {
                condition.maDonVi = '0';
            }
        }
        app.model.fwCategory.getAll(condition, '*', 'priority DESC', (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/category-donvi/:type', (req, res) => {
        let condition = req.query.condition;
        if (condition) {
            condition = {
                statement: 'title LIKE :searchText AND type LIKE :type',
                parameter: { searchText: `%${condition}%`, type: `%${req.params.type}%` }
            };
        } else {
            condition = { type: req.params.type, maDonVi: req.session.user.maDonVi };
        }
        app.model.fwCategory.getAll(condition, '*', 'priority DESC', (error, items) => {
            res.send({ error, items });
        });
    });

    app.post('/api/category', app.permission.check('category:write'), (req, res) => {
        const user = req.session.user, body = req.body.data;
        if (user && user.maDonVi) {
            body.maDonVi = user.maDonVi;
            console.log(body);
            app.model.fwCategory.create2(body, (error, item) => {
                res.send({ error, item });
            });
        } else {
            res.send({ error: 'You do not have permission' });
        }

    });

    app.put('/api/category', app.permission.check('category:write'), (req, res) =>
        app.model.fwCategory.update({ id: req.body.id }, req.body.changes, (error, item) => {
            res.send({ error, item });
        }));

    app.put('/api/category/swap', app.permission.check('category:write'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        app.model.fwCategory.swapPriority(req.body.id, isMoveUp, error => res.send({ error }));
    });

    app.delete('/api/category', app.permission.check('category:write'), (req, res) => app.model.fwCategory.delete2({ id: req.body.id }, error => res.send({ error })));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/category'));

    const uploadCategoryImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('newsCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => news');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(18), files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('eventCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => event');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(19), files.CategoryImage[0].path, done);
        } else if (fields.userData && fields.userData[0].startsWith('jobCategoryImage:') && files.CategoryImage && files.CategoryImage.length > 0) {
            console.log('Hook: uploadCategoryImage => job');
            app.uploadComponentImage(req, 'category', app.model.fwCategory, fields.userData[0].substring(17), files.CategoryImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCategoryImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCategoryImage(req, fields, files, params, done), done, 'category:write'));
};