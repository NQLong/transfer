module.exports = app => {
    const queryMenuTree = (mainCondition, done) => {
        app.model.fwMenu.getAll(mainCondition, '*', 'priority ASC', (error, items) => {
            if (items && items.length) {
                const queryItems = condition => {
                    const remainItems = items.filter(item => !condition(item));
                    const filterItems = items.filter(item => condition(item));
                    items = remainItems;
                    return [...filterItems];
                };

                // Get parentMenus
                const parentMenus = queryItems(item => item.parentId == null);
                for (const parentMenu of parentMenus) {
                    // Get menus lvl1
                    const submenus = queryItems(item => item.parentId == parentMenu.id);
                    if (submenus.length) {
                        for (const subParentMenu of submenus) {
                            // Get menus lvl2
                            const subChildMenus = queryItems(item => item.parentId == subParentMenu.id);
                            if (subChildMenus.length) subParentMenu.submenus = subChildMenus;
                        }
                    }
                    parentMenu.submenus = submenus;
                }

                done(error, parentMenus);
            } else {
                done(error, []);
            }
        });
    };

    app.model.fwMenu.getMenuTree = (done) => queryMenuTree({}, done);

    app.model.fwMenu.getDivisionMenuTree = (maDonVi, maWebsite, done) => {
        const condition = { maDonVi };
        if (maWebsite) condition.maWebsite = maWebsite;
        queryMenuTree(condition, done);
    };

    app.model.fwMenu.homeGetDivisionMenuTree = (maDonVi, maWebsite, done) => {
        const condition = { maDonVi, active: 1 };
        if (maWebsite) condition.maWebsite = maWebsite;
        queryMenuTree(condition, done);
    };
};