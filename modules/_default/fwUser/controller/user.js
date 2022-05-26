module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2060: { title: 'Người dùng', link: '/user/member' },
        },
    };
    app.permission.add(
        // { name: 'user:login', menu },
        { name: 'user:read', menu },
        { name: 'user:write', menu },
        { name: 'user:delete', menu },
    );

    app.get('/user/member', app.permission.check('user:read'), app.templates.admin);

    app.readyHooks.add('readyUser', {
        ready: () => app.database.oracle.connected && app.model.fwRole != null && app.model.fwUser != null,
        run: () => {
            app.model.fwUser.count({}, (error, numberOfUser) => {
                if (error == null) {
                    numberOfUser = Number(numberOfUser);
                    app.model.setting.setValue({ numberOfUser: isNaN(numberOfUser) ? 0 : Number(numberOfUser) });
                }
            });

            // Tạo Admin user
            new Promise((resolve, reject) => {
                app.model.fwRole.get({ name: 'admin' }, (error, role) => {
                    if (error) {
                        console.log('Error once get Admin role.');
                    } else if (role == null) {
                        app.model.fwRole.create({ name: 'admin', active: 1, isDefault: 0 }, (error, adminRole) => {
                            if (error || adminRole == null) {
                                console.log(` - #${process.pid}: Cannot create admin role!`, error.message);
                                reject();
                            } else {
                                console.log(` - #${process.pid}: Create admin role successfully!`);
                                resolve(adminRole);
                            }
                        });
                    } else if (!app.isDebug) {
                        app.model.fwRole.update({ id: role.id }, { permission: app.permission.all().toString() }, (error, role) => {
                            if (error) {
                                console.log(` - #${process.pid}: Cannot create admin role!`, error.message);
                                reject();
                            } else {
                                console.log(` - #${process.pid}: Update admin role successfully!`);
                                resolve(role);
                            }
                        });
                    } else {
                        app.model.fwRole.update({ id: role.id }, { permission: app.permission.all().toString() }, () => false);
                    }
                });
            }).then(adminRole => {
                app.adminRole = adminRole;
                return new Promise(resolve => {
                    app.model.fwUser.get({ email: app.defaultAdminEmail }, (error, adminUser) => {
                        if (error) {
                            console.log(' - Error: Cannot get default Admin User!');
                        } else if (adminUser == null) {
                            app.model.fwUser.create({ email: app.defaultAdminEmail, active: 1, isStudent: 0, isStaff: 1, shcc: '003379' }, (error, adminUser) => {
                                if (error || adminUser == null) {
                                    console.log(' - Error: Cannot generate default Admin User!', error);
                                } else {
                                    console.log(' - Generate default Admin user successfully!');
                                    resolve(adminUser);
                                }
                            });
                        } else {
                            resolve(adminUser);
                        }
                    });
                });
            }).then(() => {
                app.model.fwUserRole.get({ email: app.defaultAdminEmail, roleId: app.adminRole.id }, (error, userRole) => {
                    if (error) {
                        console.log(' - Error: Cannot get default Admin user\'s role!');
                    } else if (userRole == null) {
                        app.model.fwUserRole.create({ email: app.defaultAdminEmail, roleId: app.adminRole.id }, (error,) => {
                            if (error) {
                                console.log(' - Error: Create Admin user\'s role!');
                            } else {
                                console.log(' - Success: Create Admin user\'s role!');
                            }
                        });
                    }
                });
            });

            // Tạo Test users
            if (app.isDebug) {
                app.model.fwRole.getAll((error, roles) => {
                    if (error || roles == null) {
                        console.log('Error: Get all roles!', error);
                    } else {
                        roles.forEach(role => {
                            if (role.name != 'admin') {
                                const testEmail = role.name.toLowerCase().replaceAll(' ', '_') + '@hcmussh.edu.vn';
                                app.model.fwUser.get({ email: testEmail }, (error,) => {
                                    if (error) {
                                        console.log('Error: Get test user by email!', error);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/user/page/:pageNumber/:pageSize', app.permission.check('user:read'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            if (typeof (req.query.condition) == 'object') {
                if (req.query.condition.searchText) {
                    condition = {
                        statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(studentId) LIKE :searchText',
                        parameter: { searchText: `%${req.query.condition.searchText.toLowerCase()}%` }
                    };
                }

                if (req.query.isStaff == '1') {
                    condition.statement = condition.statement.length > 0 ? `(${condition.statement}) AND isStaff=1` : 'isStaff=1';
                }
                if (req.query.isStudent == '1') {
                    condition.statement = condition.statement.length > 0 ? `(${condition.statement}) AND isStudent=1` : 'isStudent=1';
                }
            } else {
                condition = {
                    statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(studentId) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
        }

        app.model.fwUser.getPage(pageNumber, pageSize, condition, '*', 'email ASC', (error1, page) => {
            if (page && page.list) {
                let mapperUser = {},
                    emails = page.list.map(user => {
                        mapperUser[user.email] = user;
                        return user.email;
                    });

                app.model.fwUserRole.getAll({ statement: 'email IN (:inParams)', parameter: { inParams: emails } }, (error2, userRoles) => {
                    if (userRoles) {
                        userRoles.forEach(userRole => {
                            let user = mapperUser[userRole.email];
                            if (user) {
                                if (user.roles) {
                                    user.roles.push(userRole.roleId);
                                } else {
                                    user.roles = [userRole.roleId];
                                }
                            }
                        });
                    }
                    res.send({ error1, page });
                });
            }
        });
    });

    app.get('/api/user/:email', app.permission.check('user:read'), (req, res) => {
        app.model.fwUser.get({ email: req.params.email }, (error, user) => res.send({ error, user }));
    });

    app.put('/api/user/session', app.permission.check('user:write'), (req, res) => {
        app.session.refresh(req.body.email);
        res.send('OK');
    });

    app.post('/api/user', app.permission.check('user:write'), (req, res) => {
        app.model.fwUser.get({ email: req.body.user.email }, (error, user) => {
            if (error) {
                res.send({ error: 'System has errors!' });
            } else if (user) {
                res.send({ error: 'Your email is not available!' });
            } else {
                app.model.fwUser.create(req.body.user, (error, user) => {
                    (req.body.user.roles ? req.body.user.roles : []).forEach(roleId => {
                        app.model.fwUserRole.create({ email: user.email, roleId }, () => { });
                    });
                    res.send({ error, user });
                });
            }
        });
    });

    app.put('/api/user', app.permission.check('user:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.isStaff) changes.isStaff = Number(changes.isStaff);
        if (changes.isStudent) changes.isStudent = Number(changes.isStudent);
        if (changes.active) changes.active = Number(changes.active);
        if (req.body.email == req.session.user.email && changes.active == 0) {
            res.send({ error: 'Cannot deactive your account!' });
        } else {
            new Promise((resolve, reject) => {
                app.model.fwUser.get({ email: req.body.email }, (error, user) => {
                    if (error) {
                        reject(error);
                    } else if (user) {
                        app.model.fwRole.getAll({}, (error, roles) => {
                            if (error) {
                                reject(error);
                            } else if (roles) {
                                app.model.fwUserRole.delete({ email: 'buihaphuong81@hcmussh.edu.vn' }, error => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        const roleIds = roles.map(role => role.id);
                                        if (changes.roles && changes.roles.length) {
                                            changes.roles.forEach(roleId => {
                                                roleId = Number(roleId);
                                                if (roleIds.indexOf(roleId) != -1) {
                                                    app.model.fwUserRole.create({ email: req.body.email, roleId }, () => { });
                                                }
                                            });
                                            resolve();
                                        } else {
                                            resolve();
                                        }
                                    }
                                });
                            } else {
                                reject('System has errors!');
                            }
                        });
                    } else {
                        reject('Invalid email!');
                    }
                });
            }).then(() => {
                delete changes.roles;
                if (Object.keys(changes).length > 0) {
                    app.model.fwUser.update({ email: req.body.email }, changes, (error, user) => {
                        if (req.body.email == req.session.user.email) app.updateSessionUser(req, user);
                        res.send({ error, user });
                    });
                } else {
                    res.send({});
                }
            }).catch(error => res.send({ error }));
        }
    });

    const checkGetUserPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('user:login')(req, res, next);

    app.get('/api/user-switch/page/:pageNumber/:pageSize', checkGetUserPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(shcc) LIKE :searchText OR lower(lastName || \' \' || firstName) LIKE :searchText OR email LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.fwUser.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/can-bo/item/:shcc', app.permission.check('user:read'), (req, res) => {
        app.model.canBo.get({ shcc: req.params.shcc }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/user', app.permission.check('user:delete'), (req, res) => {
        app.model.fwUser.get({ email: req.body.email }, (error, user) => {
            if (error) {
                res.send({ error: 'System has error!' });
            } else if (user) {
                if (user.image) app.deleteFile(app.path.join(app.publicPath, '/img/user', user.image));
                app.model.fwUser.delete({ email: req.body.email }, error => res.send({ error }));
            } else {
                res.send({ error: 'Invalid email!' });
            }
        });
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/user'));


    // app.uploadHooks.add('uploadYourImage', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => uploadUserImage(req, fields, files, params, done), done, 'user:login'));

    const uploadUserImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('UserImage:') && files.UserImage && files.UserImage.length) {
            // let email = fields.userData[0].substring(5),
            //     srcPath = files.UserImage[0].path,
            //     filename = app.path.basename(srcPath);
            app.model.fwUser.get({ email: fields.userData[0].substring('UserImage:'.length) }, (error, item) => {
                if (error || item == null) {
                    done({ error: error ? error : 'Invalid email!' });
                } else {
                    app.deleteImage(item.image);
                    let srcPath = files.UserImage[0].path,
                        image = '/img/user/' + app.path.basename(srcPath);
                    app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => {
                        if (error) {
                            done({ error });
                        } else {
                            image += '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.fwUser.update({ email: item.email.trim() }, { image }, (error, item) => {
                                if (error == null && req.session.user.email === item.email) {
                                    app.io.emit('avatar-changed', item);
                                    req.session.user.image = image;
                                }
                                done({ error, item, image });
                            });
                        }
                    });
                }
            });
        }
    };
    app.uploadHooks.add('UserImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadUserImage(req, fields, files, params, done), done, 'user:login'));
};