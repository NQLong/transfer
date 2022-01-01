module.exports = app => {
    app.get('/api/header', app.permission.check('menu:read'), (req, res) => {
        app.model.setting.getValue(['headerTitle', 'headerLink', 'isShowHeaderTitle'], result => res.send({ result }));
    });

    app.put('/api/header', app.permission.check('menu:write'), (req, res) => {
        const { changes } = req.body;
        app.model.setting.setValue(changes, error => res.send({ error }));
    });

    // Upload hook
    app.createFolder(app.path.join(app.publicPath, '/img/divisionHeader'));
    app.uploadHooks.add('uploadDivisionHeader', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDivisionHeader(req, fields, files, params, done), done, 'menu:write'));

    const uploadDivisionHeader = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('divisionHeader:') && files.divisionHeader && files.divisionHeader.length > 0) {
            console.log('Hook: upload division header image => division header image upload');
            const shortname = fields.userData[0].substring(15),
                srcPath = files.divisionHeader[0].path;
            let image = '/img/divisionHeader/' + shortname.replace('/', '_') + '_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dvWebsite.get({ shortname }, (error, website) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (website) {
                        app.deleteFile(srcPath);
                        if (website.header) app.deleteFile(app.path.join(app.publicPath, website.header));
                        app.model.dvWebsite.update({ shortname }, { header: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };


    app.uploadHooks.add('uploadDivisionHeaderMobile', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadDivisionHeaderMobile(req, fields, files, params, done), done, 'menu:write'));

    const uploadDivisionHeaderMobile = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('divisionHeaderMobile:') && files.divisionHeaderMobile && files.divisionHeaderMobile.length > 0) {
            console.log('Hook: upload division header mobile image => division header image upload');
            const shortname = fields.userData[0].substring(21),
                srcPath = files.divisionHeaderMobile[0].path;
            let image = '/img/divisionHeader/' + shortname.replace('/', '_') + '_' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
            app.model.dvWebsite.get({ shortname }, (error, website) => {
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    if (error) done({ error });
                    else if (website) {
                        app.deleteFile(srcPath);
                        if (website.headerMobile) app.deleteFile(app.path.join(app.publicPath, website.headerMobile));
                        app.model.dvWebsite.update({ shortname }, { headerMobile: image }, (error,) => done({ error, image: image }));
                    }
                });
            });
        }
    };

};