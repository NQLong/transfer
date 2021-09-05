module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2003: { title: 'Phòng', link: '/user/danh-muc/phong' },
        },
    };
    app.permission.add(
        { name: 'dmPhong:read', menu },
        { name: 'dmPhong:write' },
        { name: 'dmPhong:delete' },
        { name: 'dmPhong:upload' }
    );
    app.get('/user/danh-muc/phong', app.permission.check('dmPhong:read'), app.templates.admin);
    app.get('/user/danh-muc/phong/upload', app.permission.check('dmPhong:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmPhong.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/phong/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmPhong.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/phong/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmPhong.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/phong', app.permission.check('dmPhong:write'), (req, res) => {
        app.model.dmPhong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/phong', app.permission.check('dmPhong:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmPhong.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/phong', app.permission.check('dmPhong:delete'), (req, res) => {
        app.model.dmPhong.delete({ ma: req.body.ma }, (error) => res.send({ error }));
    });

    app.post('/api/danh-muc/phong/createFromFile', app.permission.check('dmPhong:write'), (req, res) => {
        let dataUpload = req.body.item;
        for (let i = 0; i < dataUpload.length; i++) {
            app.model.dmPhong.createMulti(dataUpload[i], (error, data) => {
                if (error) {
                    res.send({ error });
                }
            });
        }
        res.send('success');
    });

    app.post('/api/danh-muc/phong/upload', app.permission.check('dmPhong:upload'), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            if (error) {
                res.send({ error });
            } else {
                let hasResponsed = false;
                app.uploadHooks.run(req, fields, files, req.query, data => {
                    if (hasResponsed == false) res.send(data);
                    hasResponsed = true;
                });
            }
        });
    });


    // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    const roomImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'roomImportData' && files.RoomFile && files.RoomFile.length > 0) {
            const srcPath = files.RoomFile[0].path;
            const workbook = app.excel.create();
            const parseLanguage = (text, getAll) => {
                let obj = {};
                try { obj = JSON.parse(text); } catch { }
                if (obj.vi == null) obj.vi = text;
                if (obj.en == null) obj.en = text;
                return getAll ? obj : obj[T.language()];
            };

            workbook.xlsx.readFile(srcPath).then(() => {
                const worksheet = workbook.getWorksheet(1);
                let index = 1, room = [];
                let allBuilding = [];
                app.model.dmToaNha.getAll((error, items) => {
                    allBuilding = items;
                    while (true) {
                        index++;
                        let ma = worksheet.getCell('A' + index).value;
                        if (ma) {
                            ma = ma.toString().trim();
                            const ten = worksheet.getCell('B' + index).value ? JSON.stringify({ vi: worksheet.getCell('B' + index).value.toString().trim(), en: worksheet.getCell('B' + index).value.toString().trim() }) : '';
                            let toaNha = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '';
                            allBuilding.forEach(i => {
                                if (toaNha == parseLanguage(i.ten, true).vi) {
                                    toaNha = i.ma;
                                }
                            });
                            const moTa = JSON.stringify({ vi: worksheet.getCell('D' + index).value.toString().trim(), en: '' });
                            const kichHoat = 1;
                            room.push({ ma, ten, toaNha, moTa, kichHoat });
                        } else {
                            require('fs').unlinkSync(srcPath);
                            req.session.room = room;
                            done({
                                number: room.length,
                                room,
                                allBuilding
                            });
                            break;
                        }
                    }
                });
            });
        }
    };

    app.uploadHooks.add('roomImportData', (req, fields, files, params, done) =>
        app.permission.has(req, () => roomImportData(req, fields, files, params, done), done, 'dmPhong:write'));
};