module.exports = app => {
    app.data = {
        todayViews: 0,
        allViews: 0,
        logo: '/img/favicon.png',
        logo2: '/img/logo-ussh.png',
        footer: '/img/footer.jpg',
        map: '/img/map.png',
        facebook: 'https://www.facebook.com/ussh.vnuhcm',
        youtube: '',
        twitter: '',
        instagram: '',
        latitude: 10.7744962,
        longitude: 106.6606518,
        email: app.email.from,
        emailPassword: app.email.password,
        mobile: '(08) 2214 6555',
        address: JSON.stringify({ vi: '', en: '' }),
        schoolName: JSON.stringify({
            vi: 'Trường Đại học Khoa học Xã hội và Nhân văn',
            en: 'Ho Chi Minh City University of Social Science and Humane'
        }),
    };

    app.createFolder(
        app.assetPath, app.uploadPath, app.publicPath,
        app.path.join(app.publicPath, '/img/staff'),
    );

    app.readyHooks.add('readyInit', {
        ready: () => app.dbConnection != null && app.model != null && app.model.setting != null,
        run: () => app.model.setting.init(app.data, () => {
            app.model.setting.getValue(['todayViews', 'allViews', 'logo', 'footer', 'header', 'map', 'facebook', 'youtube', 'twitter', 'instagram', 'latitude', 'longitude', 'email', 'emailPassword', 'mobile', 'address', 'schoolName', 'tchcEmail'], result => {
                app.data.todayViews = parseInt(result.todayViews);
                app.data.allViews = parseInt(result.allViews);
                app.data.logo = result.logo;
                app.data.header = result.header;
                app.data.footer = result.footer;
                app.data.map = result.map;
                app.data.facebook = result.facebook;
                app.data.youtube = result.youtube;
                app.data.twitter = result.twitter;
                app.data.instagram = result.instagram;
                app.data.latitude = result.latitude;
                app.data.longitude = result.longitude;
                app.data.email = result.email;
                app.data.emailPassword = result.emailPassword;
                app.data.mobile = result.mobile;
                app.data.address = result.address;
                app.data.schoolName = result.schoolName;
                app.data.tchcEmail = result.tchcEmail;
            });
        }),
    });

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    const fiveMinuteJob = () => {
        const count = {
            todayViews: app.data.todayViews,
            allViews: app.data.allViews
        };
        app.io.emit('count', count);
        app.model.setting.setValue(count);
    };
    app.schedule('*/5 * * * *', app.model.setting && app.model.setting.setValue && fiveMinuteJob);

    app.schedule('0 0 * * *', () => app.data.todayViews = 0);

    // Upload ---------------------------------------------------------------------------------------------------------------------------------------
    app.post('/user/upload', app.permission.check(), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            console.log('User Upload:', fields, files, req.query);
            if (error) {
                console.log(error);
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
    app.put('/api/profile', app.permission.check(), (req, res) => {
        if (req.session.user.ma && req.body.changes) {
            const changes = {
                ngaySinh: req.body.changes.ngaySinh,
                dienThoai: req.body.changes.dienThoai,
                phai: req.body.changes.phai
            };
            app.model.fwUser.update({ ma: req.session.user.ma }, changes, (error, user) => {
                if (user) {
                    app.updateSessionUser(req, user);
                }
                res.send({ error, user });
            });
        } else {
            res.send({ eror: 'Not found user' });
        }
    });

    app.uploadComponentImage = (req, dataName, model, conditions, srcPath, sendResponse) => {
        if (conditions == 'new') {
            let imageLink = app.path.join('/img/draft', app.path.basename(srcPath)),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.rename(srcPath, sessionPath, error => {
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                sendResponse({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            if (dataName == 'dmDonVi') conditions = typeof conditions === 'object' ? conditions : { ma: conditions };
            else conditions = typeof conditions === 'object' ? conditions : { id: conditions };
            if (model) {
                model.get(conditions, (error, dataItem) => {
                    if (error || dataItem == null) {
                        sendResponse({ error: 'Invalid Id!' });
                    } else {
                        // app.deleteImage(dataItem.image);
                        let image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                        app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => {
                            if (error) {
                                sendResponse({ error });
                            } else {
                                image += '?t=' + (new Date().getTime()).toString().slice(-8);
                                delete dataItem.ma;
                                model.update(conditions, { image }, (error,) => {
                                    if (dataName == 'user') {
                                        dataItem = app.clone(dataItem, { password: '' });
                                        if (req.session.user && req.session.user.id == dataItem.id) {
                                            req.session.user.image = image;
                                        }
                                    }
                                    // if (error == null) app.io.emit(dataName + '-changed', dataItem);
                                    sendResponse({
                                        error,
                                        item: dataItem,
                                        image
                                    });
                                });
                            }
                        });
                    }
                });
            } else {
                const image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => sendResponse({ error, image }));
            }
        }
    };

    app.uploadCkEditorImage = (category, fields, files, params, done) => {
        if (files.upload && files.upload.length > 0 && fields.ckCsrfToken && params.Type == 'File' && params.category == category) {
            console.log('Hook: uploadCkEditorImage => ckEditor upload');

            const srcPath = files.upload[0].path;
            app.jimp.read(srcPath).then(image => {
                app.fs.unlinkSync(srcPath);

                if (image) {
                    if (image.bitmap.width > 1024) image.resize(1024, app.jimp.AUTO);
                    const url = `/img/${category}/${app.path.basename(srcPath)}`;
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

    app.uploadImageToBase64 = (srcPath, sendResponse) => {
        app.jimp.read(srcPath).then(image => image.getBuffer(app.jimp.MIME_PNG, (error, buffer) => {
            app.fs.unlinkSync(srcPath);

            sendResponse({
                uploaded: error == null,
                url: 'data:image/png;base64, ' + buffer.toString('base64'),
                error: { message: error ? 'Đăng hình bị lỗi!' : '' }
            });
        }));
    };

    app.uploadGuestFile = (req, srcPath, sendResponse) => {
        app.excel.readFile(srcPath, workbook => {
            app.deleteFile(srcPath);
            if (workbook) {
                const worksheet = workbook.getWorksheet(1), guests = [], totalRow = worksheet.lastRow.number;
                const handleUpload = (index = 2) => {
                    const value = worksheet.getRow(index).values;
                    if (value.length == 0 || index == totalRow + 1) {
                        sendResponse({ guests });
                    } else {
                        guests.push({ numberId: value[2], fullname: value[3], description: value[4], company: value[5] });
                        handleUpload(index + 1);
                    }
                };
                handleUpload();
            } else {
                sendResponse({ error: 'Error' });
            }
        });
    };

    app.importRegistration = (req, srcPath, sendResponse) => {
        const workbook = app.excel.create();
        workbook.xlsx.readFile(srcPath).then(() => {
            const worksheet = workbook.getWorksheet(1);
            let index = 1, participants = [];
            while (true) {
                index++;
                let organizationId = worksheet.getCell('A' + index).value;
                if (organizationId) {
                    organizationId = organizationId.toString().trim();
                    const lastname = worksheet.getCell('B' + index).value.toString().trim();
                    const firstname = worksheet.getCell('C' + index).value.toString().trim();
                    const email = worksheet.getCell('D' + index).value.toString().trim();
                    participants.push({ lastname, firstname, email, organizationId, active: true });
                } else {
                    require('fs').unlinkSync(srcPath);
                    req.session.participants = participants;
                    sendResponse({ number: participants.length });
                    break;
                }
            }
        });
    };

    app.adminUploadImage = (dataName, model, conditions, srcPath, req, res) => {
        if (conditions == 'new') {
            let imageLink = app.path.join('/img/draft', app.path.basename(srcPath)),
                sessionPath = app.path.join(app.publicPath, imageLink);
            app.fs.rename(srcPath, sessionPath, error => {
                if (error == null) req.session[dataName + 'Image'] = sessionPath;
                res.send({ error, image: imageLink });
            });
        } else {
            req.session[dataName + 'Image'] = null;
            conditions = typeof conditions === 'object' ? conditions : { id: conditions };
            if (model) {
                model.get(conditions, (error, dataItem) => {
                    if (error || dataItem == null) {
                        res.send({ error: 'Invalid Id!' });
                    } else {
                        // app.deleteImage(dataItem.image);
                        let image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                        app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => {
                            if (error) {
                                res.send({ error });
                            } else {
                                image += '?t=' + (new Date().getTime()).toString().slice(-8);
                                dataItem.image = image;
                                model.update(conditions, dataItem, (error,) => {
                                    if (dataName == 'user') {
                                        dataItem = app.clone(dataItem, { password: '' });
                                        if (req.session.user && req.session.user.shcc == dataItem.id) {
                                            req.session.user.image = image;
                                        }
                                    }
                                    res.send({ error, image, item: dataItem, });
                                });
                            }
                        });
                    }
                });
            } else {
                const image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => res.send({ error, image }));
            }
        }
    };
};