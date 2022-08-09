module.exports = app => {
    const queryMenuTree = async (mainCondition) => {
        try {
            let items = await app.model.fwMenu.getAll(mainCondition, '*', 'priority ASC');
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
                return parentMenus;
            } else {
                return [];
            }
        } catch (e) {
            return [];
        }
    };

    app.model.fwMenu.getMenuTree = async () => {
        return await queryMenuTree({});
    };

    app.model.fwMenu.getDivisionMenuTree = async (maDonVi, maWebsite) => {
        const condition = { maDonVi };
        if (maWebsite) condition.maWebsite = maWebsite;
        return await queryMenuTree(condition);
    };

    app.model.fwMenu.homeGetDivisionMenuTree = async (maDonVi, maWebsite) => {
        const condition = { maDonVi, active: 1 };
        if (maWebsite) condition.maWebsite = maWebsite;
        return await queryMenuTree(condition);
    };
};