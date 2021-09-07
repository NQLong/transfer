module.exports = app => {
    app.model.fwMenu.getMenuTree = (done) => {
        app.model.fwMenu.getAll({ parentId: null }, '*', 'priority ASC', (error, items) => {
            if (items && items.length) {
                const solve = (index = 0) => {
                    if (index < items.length) {
                        app.model.fwMenu.getAll({ parentId: items[index].id }, '*', 'priority ASC', (error, submenus) => {
                            if (submenus) items[index].submenus = submenus;
                            solve(index + 1);
                        });
                    } else {
                        done(error, items);
                    }
                };
                solve();
            } else {
                done(error, []);
            }
        });
    };

    app.model.fwMenu.getDivisionMenuTree = (maDonVi, maWebsite, done) => {
        const condition = { parentId: null, maDonVi };
        if (maWebsite) condition.maWebsite = maWebsite;
        app.model.fwMenu.getAll(condition, '*', 'priority ASC', (error, items) => {
            if (items && items.length) {
                const solve = (index = 0) => {
                    if (index < items.length) {
                        app.model.fwMenu.getAll({ parentId: items[index].id, maDonVi }, '*', 'priority ASC', (error, submenus) => {
                            if (submenus) {
                                items[index].submenus = submenus;
                                const menuLv2 = (index1 = 0) => {
                                    if (index1 == submenus.length) solve(index + 1);
                                    else {
                                        app.model.fwMenu.getAll({ parentId: submenus[index1].id, maDonVi }, '*', 'priority ASC', (error, submenus2) => {
                                            if (submenus2) submenus[index1].submenus = submenus2;
                                            items[index].submenus = submenus;
                                            menuLv2(index1 + 1);
                                        });
                                    }
                                };
                                menuLv2(0);
                            } else solve(index + 1);
                        });
                    } else {
                        done(error, items);
                    }
                };
                solve();
            } else {
                done(error, []);
            }
        });
    };

    app.model.fwMenu.homeGetDivisionMenuTree = (maDonVi, maWebsite, done) => {
        let condition = { parentId: null, maDonVi, active: 1 };
        if (maWebsite) condition.maWebsite = maWebsite;
        app.model.fwMenu.getAll(condition, '*', 'priority ASC', (error, items) => {
            if (items && items.length) {
                const solve = (index = 0) => {
                    if (index < items.length) {
                        condition.parentId = items[index].id;
                        app.model.fwMenu.getAll(condition, '*', 'priority ASC', (error, submenus) => {
                            if (submenus) {
                                items[index].submenus = submenus;
                                const menuLv2 = (index1 = 0) => {
                                    if (index1 == submenus.length) solve(index + 1);
                                    else {
                                        app.model.fwMenu.getAll({ parentId: submenus[index1].id, maDonVi, active: 1 }, '*', 'priority ASC', (error, submenus2) => {
                                            if (submenus2) submenus[index1].submenus = submenus2;
                                            items[index].submenus = submenus;
                                            menuLv2(index1 + 1);
                                        });
                                    }
                                };
                                menuLv2(0);
                            } else solve(index + 1);
                        });
                    } else {
                        done(error, items);
                    }
                };
                solve();
            } else {
                done(error, []);
            }
        });
    };
    app.model.fwMenu.createDefault = (parentId, title, link, active, madonvi, mawebsite, done) => {
        app.dbConnection.execute('BEGIN :ret:=menu_create_default(:parentId, :title, :link, :active, :madonvi, :mawebsite); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, parentId, title, link, active, madonvi, mawebsite }, done);
    };
};