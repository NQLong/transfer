module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            503: { title: 'Giao nhiệm vụ', link: '/user/hcth/giao-nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#de602f' },
        },
    };
    // app.permission.add({ name: 'president:login', menu });
    // app.permission.add({ name: 'vice-president:login', menu });
    app.permission.add({ name: 'hcthGiaoNhiemVu:read', menu});
    app.permission.add({ name: 'hcthGiaoNhiemVu:write' });
    app.permission.add({ name: 'hcthGiaoNhiemVu:delete' });

    app.get('/user/hcth/giao-nhiem-vu', app.permission.check('hcthGiaoNhiemVu:read', 'president:login'), app.templates.admin);
    app.get('/user/hcth/giao-nhiem-vu/:id', app.permission.check('hcthGiaoNhiemVu:read', 'president:login'), app.templates.admin);

    //api
    app.get('/api/hcth/giao-nhiem-vu/all', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
        app.model.hcthGiaoNhiemVu.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/giao-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['soCongVan', 'noiDung', 'chiDao']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthGiaoNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/hcth/giao-nhiem-vu/page/:pageNumber/:pageSize', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['soCongVan', 'noiDung', 'chiDao']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.hcthGiaoNhiemVu.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.post('/api/hcth/giao-nhiem-vu', app.permission.check('hcthGiaoNhiemVu:write'), (req, res) => {
        // app.model.hcthGiaoNhiemVu.create(req.body.data, (error, item) => {
        //     if (error)
        //         res.send({ error, item });
        //     else {
        //         let { id } = item;

        //         updateListFile(listCongVan, id, ({ error, listFile }) => {
        //             if (error) {
        //                 app.model.hcthGiaoNhiemVu.delete({ id }, () => res.send({ error }));
        //             } else {
        //                 let listCongVanStr = null;
        //                 try {
        //                     listCongVanStr = JSON.stringify(listFile);
        //                 } catch {
        //                     listCongVanStr = '[]';
        //                 }
        //                 app.model.hcthGiaoNhiemVu.update({ id }, { 'linkCongVan': listCongVanStr }, (errors, item) => res.send({ errors, item }));
        //             }
        //         });
        //     }
        // });
        app.model.hcthGiaoNhiemVu.create(req.body.data, (error, item) => { 
            console.log(error);
            res.send({ error, item });
        });
    });

    // const updateListFile = (listFile, id, done) => {
    //     if (!listFile || listFile.length == 0) return listFile;
    //     app.createFolder(
    //         app.path.join(app.assetPath, `/congVanDen/${id}`)
    //     );
    //     const pattern = /\/new.*/;
    //     const newList = listFile.map(fileName => {
    //         if (pattern.test(fileName)) {
    //             const
    //                 destFile = fileName.replace('new', `${id}`),
    //                 destPath = app.assetPath + '/congVanDen' + destFile,
    //                 srcPath = app.assetPath + '/congVanDen' + fileName;
    //             app.fs.rename(srcPath, destPath, error => {
    //                 if (error)
    //                     done && done({ error });
    //             });
    //             return destFile;
    //         }
    //         return fileName;
    //     });
    //     done && done({ error: null, listFile: newList });
    // };


    app.put('/api/hcth/giao-nhiem-vu', app.permission.check('hcthGiaoNhiemVu:write'), (req, res) => {
        app.model.hcthGiaoNhiemVu.update({ id: req.body.id }, req.body.changes, (errors, items) => res.send({ errors, items }));
    });

    app.delete('/api/hcth/giao-nhiem-vu', app.permission.check('hcthGiaoNhiemVu:delete'), (req, res) => {
        app.model.hcthGiaoNhiemVu.delete({ id: req.body.id }, errors => {
            app.deleteFolder(app.assetPath + '/congVanDen/' + req.body.id);
            res.send({ errors });
        });
    });

    app.get('/api/hcth/giao-nhiem-vu/search/page/:pageNumber/:pageSize', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let { donViNhan, canBoNhan, ngayHetHan, userId } = (req.query.filter && req.query.filter != '%%%%%%') ? req.query.filter :
            { donViNhan: null, canBoNhan: null, ngayHetHan: null, userId: req.query.filter.userId };
        donViNhan = donViNhan || null;
        canBoNhan = canBoNhan || null;
        ngayHetHan = ngayHetHan || null;

        //const nguoiTao = req.query.userId;
        // timeType = timeType || null;
        // fromTime = fromTime || null;
        // toTime = toTime || null;
        app.model.hcthGiaoNhiemVu.searchPage(pageNumber, pageSize, userId, donViNhan, canBoNhan, ngayHetHan, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    // app.createFolder(app.path.join(app.assetPath, '/congVanDen'));


    // app.uploadHooks.add('hcthGiaoNhiemVuFile', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => hcthGiaoNhiemVuFile(req, fields, files, params, done), done, 'staff:login'));

    // const hcthGiaoNhiemVuFile = (req, fields, files, params, done) => {
    //     if (
    //         fields.userData &&
    //         fields.userData[0] &&
    //         fields.userData[0].startsWith('hcthGiaoNhiemVuFile') &&
    //         files.hcthGiaoNhiemVuFile &&
    //         files.hcthGiaoNhiemVuFile.length > 0) {
    //         const
    //             srcPath = files.hcthGiaoNhiemVuFile[0].path,
    //             isNew = fields.userData[0].substring(19) == 'new',
    //             id = fields.userData[0].substring(19),
    //             filePath = (isNew ? '/new/' : `/${id}/`) + (new Date().getTime()).toString() + '_' + files.hcthGiaoNhiemVuFile[0].originalFilename,
    //             destPath = app.assetPath + '/congVanDen' + filePath,
    //             validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
    //             baseNamePath = app.path.extname(srcPath);
    //         if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
    //             done({ error: 'Định dạng tập tin không hợp lệ!' });
    //             app.deleteFile(srcPath);
    //         } else {
    //             app.createFolder(
    //                 app.path.join(app.assetPath, '/congVanDen/' + (isNew ? '/new' : '/' + id))
    //             );
    //             app.fs.rename(srcPath, destPath, error => {
    //                 if (error) {
    //                     done({ error });
    //                 } else {
    //                     done({ data: filePath });
    //                 }
    //             });
    //         }
    //     }
    // };

    // //Delete file
    // app.put('/api/hcth/giao-nhiem-vu/delete-file', app.permission.check('hcthGiaoNhiemVu:delete'), (req, res) => {
    //     const
    //         id = req.body.id,
    //         index = req.body.index,
    //         file = req.body.file;
    //     app.model.hcthGiaoNhiemVu.get({ id: id }, (error, item) => {
    //         if (error) {
    //             res.send({ error });
    //         } else if (item && item.linkCongVan) {
    //             try {
    //                 let newList = JSON.parse(item.linkCongVan);
    //                 const filePath = app.assetPath + '/congVanDen' + newList[index];
    //                 newList.splice(index, 1);
    //                 const newListStr = JSON.stringify(newList);
    //                 if (app.fs.existsSync(filePath))
    //                     app.deleteFile(filePath);
    //                 app.model.hcthGiaoNhiemVu.update(id, { linkCongVan: newListStr }, (error, item) => {
    //                     res.send({ error, item });
    //                 });
    //             } catch {
    //                 res.send({ error: 'Cập nhật danh sách tệp tin công văn thấ t bại' });
    //             }
    //         } else {
    //             const filePath = app.path.join(app.assetPath, '/congVanDen', file);
    //             if (app.fs.existsSync(filePath)) {
    //                 app.deleteFile(filePath);
    //                 res.send({ error: null });
    //             } else {
    //                 res.send({ error: 'Không tìm thấy công văn' });
    //             }
    //         }
    //     });
    // });

    // app.get('/api/hcth/giao-nhiem-vu/download/:id/:fileName', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
    //     const { id, fileName } = req.params;
    //     const dir = app.path.join(app.assetPath, `/congVanDen/${id}`);
    //     if (app.fs.existsSync(dir)) {
    //         const serverFileNames = app.fs.readdirSync(dir).filter(v => app.fs.lstatSync(app.path.join(dir, v)).isFile());
    //         for (const serverFileName of serverFileNames) {
    //             const clientFileIndex = serverFileName.indexOf(fileName);
    //             if (clientFileIndex !== -1 && serverFileName.slice(clientFileIndex) === fileName) {
    //                 return res.sendFile(app.path.join(dir, serverFileName));
    //             }
    //         }
    //     }

    //     res.status(400).send('Không tìm thấy tập tin');
    // });

    app.get('/api/hcth/giao-nhiem-vu/:id', app.permission.check('hcthGiaoNhiemVu:read'), (req, res) => {
        const id = req.params.id;
        app.model.hcthGiaoNhiemVu.get({ id }, (error, item) => {
            if (error)
                res.send({ error, item });
            else {
                app.model.hcthGiaoNhiemVu.getAllPhanHoi(id, (errors, chiDao) => {
                    res.send({ error: error || errors, item: { ...item, danhSachPhanHoi: chiDao?.rows || [] } });
                });
            }
        });
        //app.model.hcthGiaoNhiemVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });
};
