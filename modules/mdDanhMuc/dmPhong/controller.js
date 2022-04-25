module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4059: { title: 'Phòng học', link: '/user/danh-muc/phong' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7008: { title: 'Phòng học', link: '/user/dao-tao/phong', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmPhong:read', menu },
        { name: 'dtPhong:read', menu: menuDaoTao },
        { name: 'dmPhong:write' },
        { name: 'dmPhong:delete' },
        { name: 'dmPhong:upload' }
    );
    app.get('/user/:menu/phong', app.permission.orCheck('dmPhong:read', 'dtPhong:read'), app.templates.admin);
    app.get('/user/danh-muc/phong/upload', app.permission.check('dmPhong:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/phong/page/:pageNumber/:pageSize', app.permission.orCheck('dmPhong:read', 'dtPhong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmPhong.getPage(pageNumber, pageSize, {
            statement: 'lower(ten) LIKE :searchText',
            parameter: {
                searchText: `%${req.query.condition ? req.query.condition.toLowerCase() : ''}%`
            }
        }, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/phong/all', app.permission.orCheck('dmPhong:read', 'dtPhong:read'), (req, res) => {
        let condition = {};
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: {
                    searchText: `%${req.query.condition.toLowerCase()}%`
                }
            };
        }
        app.model.dmPhong.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/phong/item/:ten', app.permission.orCheck('dmPhong:read', 'dtPhong:read'), (req, res) => {
        app.model.dmPhong.get({ ten: req.params.ten }, (error, item) => res.send({ error, item }));
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
            app.model.dmPhong.createMulti(dataUpload[i], (error) => {
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


    // // Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
    // const roomImportData = (req, fields, files, params, done) => {
    //     if (fields.userData && fields.userData[0] && fields.userData[0] == 'roomImportData' && files.RoomFile && files.RoomFile.length > 0) {
    //         const srcPath = files.RoomFile[0].path;
    //         const workbook = app.excel.create();
    //         const parseLanguage = (text, getAll) => {
    //             let obj = {};
    //             try { obj = JSON.parse(text); } catch (e) { console.error(e); }
    //             if (obj.vi == null) obj.vi = text;
    //             if (obj.en == null) obj.en = text;
    //             return getAll ? obj : obj[T.language()];
    //         };

    //         workbook.xlsx.readFile(srcPath).then(() => {
    //             const worksheet = workbook.getWorksheet(1);
    //             let index = 1, room = [];
    //             let allBuilding = [];
    //             app.model.dmToaNha.getAll((error, items) => {
    //                 allBuilding = items;
    //                 while (true) {
    //                     index++;
    //                     let ten = worksheet.getCell('A' + index).value;
    //                     if (ten) {
    //                         ten = ten.toString().trim();
    //                         const ten = worksheet.getCell('B' + index).value ? JSON.stringify({ vi: worksheet.getCell('B' + index).value.toString().trim(), en: worksheet.getCell('B' + index).value.toString().trim() }) : '';
    //                         let toaNha = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '';
    //                         allBuilding.forEach(i => {
    //                             if (toaNha == parseLanguage(i.ten, true).vi) {
    //                                 toaNha = i.ten;
    //                             }
    //                         });
    //                         const moTa = JSON.stringify({ vi: worksheet.getCell('D' + index).value.toString().trim(), en: '' });
    //                         const kichHoat = 1;
    //                         room.push({ ten, toaNha, moTa, kichHoat });
    //                     } else {
    //                         require('fs').unlinkSync(srcPath);
    //                         req.session.room = room;
    //                         done({
    //                             number: room.length,
    //                             room,
    //                             allBuilding
    //                         });
    //                         break;
    //                     }
    //                 }
    //             });
    //         });
    //     }
    // };

    // app.uploadHooks.add('roomImportData', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => roomImportData(req, fields, files, params, done), done, 'dmPhong:write'));
};