// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tccbDanhGiaFormChuyenVienParent.foo = () => { };
    app.model.tccbDanhGiaFormChuyenVienParent.getAllByYear = async (nam) => {
        let listParent = await app.model.tccbDanhGiaFormChuyenVienParent.getAll({ nam }, '*', 'thuTu ASC');
        if (listParent.length == 0) return [];
        let listId = listParent.map(item => item.id);
        let listChild = await app.model.tccbDanhGiaFormChuyenVienChild.getAll({
            statement: 'parentId IN (:listId)',
            parameter: {
                listId,
            }
        });
        const items = listParent.map(parent => {
            if (parent.loaiCongViec == 0) {
                return {
                    ...parent,
                    submenus: listChild.filter(child => child.parentId == parent.id)
                };
            }
            return {
                ...parent,
                submenus: []
            };
        });
        return items;
    };

    app.model.tccbDanhGiaFormChuyenVienParent.deleteByYear = async (nam) => {
        let listParent = await app.model.tccbDanhGiaFormChuyenVienParent.getAll({ nam }, '*', 'thuTu ASC');
        if (listParent.length == 0) return;
        let listId = listParent.map(item => item.id);
        await Promise.all([
            app.model.tccbDanhGiaFormChuyenVienChild.delete({
                statement: 'parentId IN (:listId)',
                parameter: {
                    listId,
                }
            }),
            app.model.tccbDanhGiaFormChuyenVienParent.delete({ nam })
        ]);
    };

    app.model.tccbDanhGiaFormChuyenVienParent.cloneByYear = async (oldNam, newNam) => {
        let listParent = await app.model.tccbDanhGiaFormChuyenVienParent.getAll({ nam: oldNam });
        if (listParent.length == 0) return;
        let listId = listParent.map(item => item.id);
        let listChild = await app.model.tccbDanhGiaFormChuyenVienChild.getAll({
            statement: 'parentId IN (:listId)',
            parameter: {
                listId,
            }
        });
        const items = listParent.map(parent => {
            if (parent.loaiCongViec == 0) {
                return {
                    ...parent,
                    submenus: listChild.filter(child => child.parentId == parent.id)
                };
            }
            return {
                ...parent,
                submenus: []
            };
        });
        const listNewParent = await Promise.all(items.map(item => {
            const newItem = { ...item };
            delete newItem.id;
            delete newItem.submenus;
            newItem.nam = newNam;
            return app.model.tccbDanhGiaFormChuyenVienParent.create(newItem);
        }));
        let listNewChild = items.map((parentItem, index) => {
            return parentItem.submenus.map(submenu => {
                delete submenu.id;
                delete submenu.parentId;
                return { ...submenu, parentId: listNewParent[index].id };
            });
        });
        listNewChild = listNewChild.reduce((prev, cur) => prev.concat(cur));
        await Promise.all(listNewChild.map(item => app.model.tccbDanhGiaFormChuyenVienChild.create(item)));
    };
};