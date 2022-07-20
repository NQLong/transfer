module.exports = app => {
    app.createFolder(
        app.assetPath, app.uploadPath, app.publicPath, app.documentPath,
        app.path.join(app.publicPath, '/img/staff'),
    );

    // Count views ----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('todaySchedule', {
        ready: () => app.database.redis,
        run: () => {
            app.primaryWorker && app.schedule('0 0 * * *', () => {
                // const today = new Date();
                // Cập nhật biến đếm ngày hôm nay về 0
                app.database.redis.set(`${app.appName}_state:todayViews`, 0);
            });
        },
    });

    // Clear sessions ----------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('clearSessionSchedule', {
        ready: () => app.database.redis,
        run: () => {
            app.primaryWorker && app.schedule('5 0 * * *', () => { // 00h05 hằng ngày
                console.log(' - Schedule: Clear session user');
                const sessionPrefix = app.appName + '_sess:';
                app.database.redis.keys(sessionPrefix + '*', async (error, keys) => {
                    // Tính toán hôm nay và 7 ngày trước
                    const today = new Date().yyyymmdd();
                    let last7Day = new Date();
                    last7Day.setDate(last7Day.getDate() - 7);
                    last7Day = last7Day.yyyymmdd();

                    if (!error) {
                        // Lấy sessionUser
                        const getKey = (key) => new Promise(resolve => {
                            app.database.redis.get(key, (_, item) => resolve(JSON.parse(item)));
                        });

                        try {
                            let deleteCounter = 0;
                            console.log('Total sessions: ', keys.length); // Tổng cộng sessions
                            for (const key of keys) {
                                const sessionUser = await getKey(key);
                                if (!sessionUser) { // Không có session
                                    await app.database.redis.del(key);
                                    deleteCounter++;
                                } else if (sessionUser.user) { // Có login
                                    // Nếu ko có today hoặc session lâu hơn 7 ngày => Xóa session
                                    if (!sessionUser.today || parseInt(sessionUser.today) < parseInt(last7Day)) {
                                        await app.database.redis.del(key);
                                        deleteCounter++;
                                    }
                                } else {
                                    // Không login
                                    if (!sessionUser.today || today != sessionUser.today) { // Session cũ => Xóa session
                                        await app.database.redis.del(key);
                                        deleteCounter++;
                                    }
                                }
                            }
                            console.log(' - Number of deleted sessions: ', deleteCounter);
                            console.log(' - Schedule: Clear session user done!');
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
            });
        },
    });

    // Upload ---------------------------------------------------------------------------------------------------------------------------------------
    app.post('/user/upload', app.permission.check(), (req, res) => {
        app.getUploadForm().parse(req, (error, fields, files) => {
            console.log('User Upload:', fields, files, req.query);
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
            app.fs.copyFile(srcPath, sessionPath, error => {
                app.deleteFile(srcPath);
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
                        let image = '/img/' + dataName + '/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
                        app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                            if (error) {
                                sendResponse({ error });
                            } else {
                                app.deleteFile(srcPath);
                                image += '?t=' + (new Date().getTime()).toString().slice(-8);
                                delete dataItem.ma;
                                model.update(conditions, { image }, (error,) => {
                                    if (dataName == 'user') {
                                        dataItem = app.clone(dataItem, { password: '' });
                                        if (req.session.user && req.session.user.id == dataItem.id) {
                                            req.session.user.image = image;
                                        }
                                    }
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
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    app.deleteFile(srcPath);
                    sendResponse({ error, image });
                });
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
            app.fs.copyFile(srcPath, sessionPath, error => {
                app.deleteFile(srcPath);
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
                        app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                            if (error) {
                                res.send({ error });
                            } else {
                                app.deleteFile(srcPath);
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
                app.fs.copyFile(srcPath, app.path.join(app.publicPath, image), error => {
                    app.deleteFile(srcPath);
                    res.send({ error, image });
                });
            }
        }
    };

    // System state ---------------------------------------------------------------------------------------------------------------------------------
    app.state = {
        prefixKey: `${app.appName}_state:`,

        initState: {
            todayViews: 0,
            allViews: 38838475,
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
            address2: JSON.stringify({ vi: '', en: '' }),
            schoolName: JSON.stringify({
                vi: 'Trường Đại học Khoa học Xã hội và Nhân văn',
                en: 'Ho Chi Minh City University of Social Science and Humane'
            }),
            linkMap: '',
            header: '/img/header.jpg'
        },

        init: () => app.database.redis.keys(`${app.appName}_state:*`, (_, keys) => {
            keys && Object.keys(app.state.initState).forEach(key => {
                const redisKey = `${app.appName}_state:${key}`;
                if (!keys.includes(redisKey) && app.state.initState[key]) app.database.redis.set(redisKey, app.state.initState[key]);
            });
        }),

        get: (...params) => new Promise((resolve, reject) => {
            const n = params.length, prefixKeyLength = app.state.prefixKey.length;
            const keys = n == 0 ? app.state.keys : params.map(key => `${app.appName}_state:${key}`); // get chỉ có done => đọc hết app.state
            app.database.redis.mget(keys, (error, values) => {
                if (error || values == null) {
                    reject(error || 'Error when get Redis value!');
                } else if (n == 1) { // Get 1 value
                    resolve(values[0]);
                } else {
                    const state = {};
                    keys.forEach((key, index) => state[key.substring(prefixKeyLength)] = values[index]);
                    resolve(state);
                }
            });
        }),

        set: (...params) => new Promise((resolve, reject) => {
            const n = params.length;
            for (let i = 0; i < n - 1; i += 2) params[i] = app.state.prefixKey + params[i];
            app.database.redis.mset(params, error => error ? reject(error) : resolve());
        }),
    };
    app.state.keys = Object.keys(app.state.initState).map(key => app.state.prefixKey + key);

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyInitState', {
        ready: () => app.database.redis,
        run: () => app.primaryWorker && app.state.init(),
    });
};