module.exports = app => {
    const checkPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            if (req.session.user.permissions && req.session.user.permissions.contains(permissions)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const checkOrPermissions = (req, res, next, permissions) => {
        if (req.session.user) {
            const user = req.session.user;
            if (user.permissions && user.permissions.exists(permissions)) {
                next();
            } else if (permissions.length == 0) {
                next();
            } else {
                responseError(req, res);
            }
        } else {
            responseError(req, res);
        }
    };

    const responseError = (req, res) => {
        if (req.method.toLowerCase() === 'get') { // is get method
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: req.session.user ? 'request-permissions' : 'request-login' });
            } else {
                res.redirect(req.session.user ? '/request-permissions' : '/request-login');
            }
        } else {
            res.send({ error: 'You don\'t have permission!' });
        }
    };
    const responseWithPermissions = (req, success, fail, permissions) => {
        if (req.session.user) {
            if (req.session.user.permissions && req.session.user.permissions.contains(permissions)) {
                success();
            } else {
                fail && fail();
            }
        } else if (permissions.length == 0) {
            success();
        } else {
            fail && fail();
        }
    };

    const systemPermission = [];
    const menuTree = {};
    app.permission = {
        all: () => [...systemPermission],

        tree: () => app.clone(menuTree),

        add: (...permissions) => {
            permissions.forEach(permission => {
                if (typeof permission == 'string') {
                    permission = { name: permission };
                } else if (permission.menu) {
                    if (permission.menu.parentMenu) {
                        const { index, subMenusRender } = permission.menu.parentMenu;
                        if (menuTree[index] == null) {
                            menuTree[index] = {
                                parentMenu: app.clone(permission.menu.parentMenu),
                                menus: {}
                            };
                        }
                        if (permission.menu.menus == null) {
                            menuTree[index].parentMenu.permissions = [permission.name];
                        }
                        menuTree[index].parentMenu.subMenusRender = menuTree[index].parentMenu.subMenusRender || (subMenusRender != null ? subMenusRender : true);
                    }

                    const menuTreeItem = menuTree[permission.menu.parentMenu.index],
                        submenus = permission.menu.menus;
                    if (submenus) {
                        Object.keys(submenus).forEach(menuIndex => {
                            if (menuTreeItem.menus[menuIndex]) {
                                const menuTreItemMenus = menuTreeItem.menus[menuIndex];
                                if (menuTreItemMenus.title == submenus[menuIndex].title && menuTreItemMenus.link == submenus[menuIndex].link) {
                                    menuTreItemMenus.permissions.push(permission.name);
                                } else {
                                    console.error(`Menu index #${menuIndex} is not available!`);
                                }
                            } else {
                                menuTreeItem.menus[menuIndex] = app.clone(submenus[menuIndex], { permissions: [permission.name] });
                            }
                        });
                    }
                }

                systemPermission.includes(permission.name) || systemPermission.push(permission.name);
            });
        },

        check: (...permissions) => (req, res, next) => {
            if (app.isDebug && req.session.user == null) {
                const personId = req.cookies.personId || '003379';
                const condition = {
                    statement: 'shcc=:personId OR studentId=:personId OR email=:personId',
                    parameter: { personId }
                };
                app.model.fwUser.get(condition, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkPermissions(req, res, next, permissions));
                    }
                });
            } else {
                checkPermissions(req, res, next, permissions);
            }
        },

        orCheck: (...permissions) => (req, res, next) => {
            if (app.isDebug && req.session.user == null) {
                const personId = req.cookies.personId || '003379';
                const condition = {
                    statement: 'shcc=:personId OR studentId=:personId OR email=:personId',
                    parameter: { personId }
                };
                app.model.fwUser.get(condition, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => checkOrPermissions(req, res, next, permissions));
                    }
                });
            } else {
                checkOrPermissions(req, res, next, permissions);
            }
        },


        has: (req, success, fail, ...permissions) => {
            if (typeof fail == 'string') {
                permissions.unshift(fail);
                fail = null;
            }
            if (app.isDebug && (req.session.user == null || req.session.user == undefined)) {
                const personId = req.cookies.personId || '003379';
                app.model.fwUser.get({ shcc: personId }, (error, user) => {
                    if (error || user == null) {
                        fail && fail({ error: 'System has errors!' });
                    } else {
                        app.updateSessionUser(req, user, () => responseWithPermissions(req, success, fail, permissions));
                    }
                });
            } else {
                responseWithPermissions(req, success, fail, permissions);
            }
        },

        getTreeMenuText: () => {
            let result = '';
            Object.keys(menuTree).sort().forEach(parentIndex => {
                result += `${parentIndex}. ${menuTree[parentIndex].parentMenu.title} (${menuTree[parentIndex].parentMenu.link})\n`;

                Object.keys(menuTree[parentIndex].menus).sort().forEach(menuIndex => {
                    const submenu = menuTree[parentIndex].menus[menuIndex];
                    result += `\t${menuIndex} - ${submenu.title} (${submenu.link})\n`;
                });
            });
            app.fs.writeFileSync(app.path.join(app.assetPath, 'menu.txt'), result);
        }
    };

    // Update user's session ------------------------------------------------------------------------------------------------------------------------
    const initManager = (user, listChucVuTruong = ['013', '005', '003', '016', '009', '007']) => {
        if (!(user && user.staff && user.staff.listChucVu && user.staff.listChucVu.length)) {
            return [];
        } else {
            const listChucVu = user.staff.listChucVu;
            return listChucVu.filter(item => listChucVuTruong.includes(item.maChucVu)).map(item => app.clone(item, { isManager: true }));
        }
    };

    const hasPermission = (userPermissions, menuPermissions) => {
        for (let i = 0; i < menuPermissions.length; i++) {
            if (userPermissions.includes(menuPermissions[i])) return true;
        }
        return false;
    };

    app.updateSessionUser = (req, user, done) => {
        user = app.clone(user, { permissions: [], menu: {} });
        delete user.password;

        app.model.fwUser.getUserRoles(user.email, (error, result) => {
            if (error || result == null || result.rows == null) {
                console.error('app.updateSessionUser', error);
            } else {
                user.roles = result.rows;
                for (let i = 0; i < user.roles.length; i++) {
                    let role = user.roles[i];
                    if (role.name == 'admin') {
                        user.permissions = app.permission.all();
                        break;
                    }
                    (role.permission ? role.permission.split(',') : []).forEach(permission => app.permissionHooks.pushUserPermission(user, permission.trim()));
                }

                // Add login permission => user.active == 1 => user:login
                if (user.active == 1) app.permissionHooks.pushUserPermission(user, 'user:login');
                new Promise(resolve => {
                    //Check if user if a staff
                    user.isStaff && app.permissionHooks.pushUserPermission(user, 'staff:login');
                    app.model.canBo.get({ email: user.email }, (e, item) => {
                        if (e || item == null) {
                            user.isStaff = 0;
                            app.permissionHooks.remove(user, 'staff:login');
                            resolve();
                        } else {
                            user.isStaff = 1;
                            item.phai == '02' && app.permissionHooks.pushUserPermission(user, 'staff:female');
                            user.shcc = item.shcc;
                            user.firstName = item.ten;
                            user.lastName = item.ho;
                            user.staff = {
                                shcc: item.shcc,
                                listChucVu: [],
                                maDonVi: item.maDonVi,
                            };
                            const condition = {
                                statement: 'shcc = :shcc AND (ngayRaQd < :today) AND (ngayRaQdThoiChucVu < :today)',
                                parameter: {
                                    shcc: item.shcc,
                                    today: new Date().getTime()
                                }
                            };
                            app.permissionHooks.pushUserPermission(user, 'staff:login'); // Add staff permission: staff:login

                            app.model.qtChucVu.getAll(condition, 'maChucVu,maDonVi', null, (e, listChucVu) => {
                                user.staff.listChucVu = listChucVu || [];
                                let permissionLoaiDonVi = {
                                    1: 'faculty:login',
                                    2: 'department:login',
                                    3: 'center:login',
                                    4: 'union:login'
                                };
                                user.staff.maDonVi ? app.model.dmDonVi.get({ ma: user.staff.maDonVi }, (error, donVi) => {
                                    if (!error && donVi && donVi.maPl) {
                                        app.permissionHooks.pushUserPermission(user, permissionLoaiDonVi[donVi.maPl]);
                                        resolve();
                                    } else resolve();
                                }) : resolve();
                            });

                        }
                    });
                }).then(() => new Promise(resolve => {
                    //Check cán bộ đặc biệt
                    if (user.isStaff) {
                        // Cán bộ quản lý
                        user.staff.donViQuanLy = initManager(user);
                        user.staff.donViQuanLy.length && app.permissionHooks.pushUserPermission(user, 'manager:read', 'manager:write', 'fwAssignRole:write', 'fwAssignRole:read');

                        if (user.staff.maDonVi == 68) {
                            app.permissionHooks.pushUserPermission(user, 'rectors:login');
                            if (user.staff.listChucVu.some(item => item.maChucVu == '001')) {
                                app.permissionHooks.pushUserPermission(user, 'president:login');
                            } else {
                                app.permissionHooks.pushUserPermission(user, 'vice-president:login');
                            }
                        }
                        app.permissionHooks.run('staff', user, user.staff).then(() => {
                            resolve();
                        });
                    } else resolve();
                })).then(() => new Promise(resolve => {
                    // AssignRole hooks
                    if (user.isStaff) {
                        app.model.fwAssignRole.getAll({ nguoiDuocGan: user.shcc }, (error, roles) => {
                            if (!error || roles != []) {
                                const checkExpire = role => !role.ngayKetThuc || new Date(role.ngayKetThuc).getTime() > new Date().getTime();
                                // Xóa các role đã hết hạn
                                const validRoles = roles.filter(checkExpire);
                                const invalidRoles = roles.filter(role => !checkExpire(role));
                                if (invalidRoles.length) {
                                    app.model.fwAssignRole.delete({
                                        statement: 'id IN (:roles)',
                                        parameter: { roles: invalidRoles.map(role => role.id) }
                                    }, () => { });
                                }
                                if (validRoles.length) {
                                    app.permissionHooks.run('assignRole', user, validRoles).then(() => {
                                        resolve();
                                    });
                                } else resolve();
                            } else resolve();
                        });
                    } else resolve();
                })).then(() => new Promise(resolve => {
                    if (!user.isStaff && user.studentId) {
                        app.model.fwStudents.get({ mssv: user.studentId }, (error, student) => {
                            if (student) {
                                app.permissionHooks.pushUserPermission(user, 'student:login');
                                user.isStudent = 1;
                                user.active = 1;
                                user.data = student;
                                resolve();
                            } else resolve();
                        });
                    } else resolve();
                })).then(() => {
                    user.menu = app.permission.tree();
                    Object.keys(user.menu).forEach(parentMenuIndex => {
                        let flag = true;
                        const menuItem = user.menu[parentMenuIndex];
                        if (menuItem.parentMenu && menuItem.parentMenu.permissions) {
                            if (hasPermission(user.permissions, menuItem.parentMenu.permissions)) {
                                delete menuItem.parentMenu.permissions;
                            } else {
                                delete user.menu[parentMenuIndex];
                                flag = false;
                            }
                        }

                        flag && Object.keys(menuItem.menus).forEach(menuIndex => {
                            const menu = menuItem.menus[menuIndex];
                            if (hasPermission(user.permissions, menu.permissions)) {
                                delete menu.permissions;
                            } else {
                                delete menuItem.menus[menuIndex];
                                if (Object.keys(menuItem.menus).length == 0) delete user.menu[parentMenuIndex];
                            }
                        });
                    });

                    if (req) {
                        req.session.user = user;
                        req.session.save();
                    }
                    done && done(user);
                });
            }
        });
    };


    // Permission Hook ------------------------------------------------------------------------------------------------------------------------------
    const permissionHookContainer = { student: {}, staff: {}, assignRole: {} };
    app.permissionHooks = {
        add: (type, name, hook) => {
            if (permissionHookContainer[type]) {
                permissionHookContainer[type][name] = hook;
            } else {
                console.log('Invalid hook type!');
            }
        },
        remove: (type, name) => {
            if (permissionHookContainer[type] && permissionHookContainer[type][name]) {
                delete permissionHookContainer[type][name];
            }
        },

        run: (type, user, role) => new Promise((resolve) => {
            const hookContainer = permissionHookContainer[type],
                hookKeys = hookContainer ? Object.keys(hookContainer) : [];
            const runHook = (index = 0) => {
                if (index < hookKeys.length) {
                    const hookKey = hookKeys[index];
                    hookContainer[hookKey](user, role).then(() => runHook(index + 1));
                } else {
                    resolve();
                }
            };
            runHook();
        }),

        pushUserPermission: function () {
            if (arguments.length >= 1) {
                const user = arguments[0];
                for (let i = 1; i < arguments.length; i++) {
                    const permission = arguments[i];
                    if (!user.permissions.includes(permission)) user.permissions.push(permission);
                }
            }
        },
    };

    // Assign roles Hook ------------------------------------------------------------------------------------------------------------------------------
    const assignListContainer = {}; // Ex: { quanLyDonVi: [{ id: 'dnDoanhNghiep:manage', text: 'Quản lý doanh nghiệp' }] }
    const assignRolePermissionHookContainer = {};
    // Hook: Trả về true hoặc false ==> hook trúng, trả về undefined|null => không hook
    app.assignRoleHooks = {
        addRoles: (name, ...roles) => {
            if (assignListContainer[name]) {
                const currentId = assignListContainer[name].map(role => role.id);
                const filteredRoles = roles.filter(role => !currentId.includes(role.id));
                assignListContainer[name].push(...filteredRoles);
            } else {
                assignListContainer[name] = roles;
            }
        },
        get: (name) => {
            if (typeof name == 'string') name = [name];
            let listPermission = [];
            name.forEach(roleName => {
                if (assignListContainer[roleName]) {
                    listPermission.push(...assignListContainer[roleName].map(item => app.clone(item, { nhomRole: roleName })));
                }
            });
            return listPermission;
        },

        addHook: (name, hook) => assignRolePermissionHookContainer[name] = hook, // Hook is Promise object | parameters: req, roles
        check: async (req, roles) => {
            const hooks = Object.values(assignRolePermissionHookContainer);
            let checkFlag = null;
            for (const hook of hooks) {
                checkFlag = await hook(req, roles);
                if (typeof checkFlag == 'boolean') break; // Hook trúng => Break luôn
            }

            if (checkFlag) return true;
            else throw 'Permission denied!';
        }
    };

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('permissionInit', {
        ready: () => app.database.oracle.connected && app.model.fwRole != null,
        run: () => app.isDebug && app.permission.getTreeMenuText(),
    });
};