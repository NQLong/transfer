// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tccbDinhMucCongViecGvVaNcv.foo = () => { };
    app.model.tccbDinhMucCongViecGvVaNcv.deleteByYear = async (nam) => {
        const listNhom = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam });
        const listId = listNhom.map(nhom => nhom.id);
        await Promise.all([
            app.model.tccbNhomDanhGiaNhiemVu.delete({ nam }),
            app.model.tccbDinhMucCongViecGvVaNcv.delete({ statement: 'idNhom IN (:listId)', parameter: { listId } }),
        ]);
    };

    app.model.tccbDinhMucCongViecGvVaNcv.getAllByYear = async (nam) => {
        const [listNhom, listNgach, listChucDanhKhoaHoc] = await Promise.all([
            app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam }),
            app.model.dmNgachCdnn.getAll(),
            app.model.dmChucDanhKhoaHoc.getAll(),
        ]);
        const listChucDanh = listNgach.concat(listChucDanhKhoaHoc);
        const listId = listNhom.map(nhom => nhom.id);
        const items = await app.model.tccbDinhMucCongViecGvVaNcv.getAll({ statement: 'idNhom IN (:listId)', parameter: { listId } }, '*', 'idNhom');
        const result = items.map(item => {
            const itemChucDanhIds = item.maChucDanh.split(',');
            const chucDanhs = itemChucDanhIds.map(ma => {
                const index = listChucDanh.findIndex(chucDanh => chucDanh.ma == ma);
                return index == -1 ? '' : listChucDanh[index].ten;
            });
            const index = listNhom.findIndex(nhom => nhom.id == item.idNhom);
            return {
                ...item,
                chucDanhs: chucDanhs.join('; '),
                tenNhom: index != -1 ? listNhom[index].ten : '',
            };
        });
        return result;
    };

    app.model.tccbDinhMucCongViecGvVaNcv.cloneByYear = async (oldNam, newNam) => {
        const listNhom = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam: oldNam });
        const listDinhMuc = await app.model.tccbDinhMucCongViecGvVaNcv.getAll({ statement: 'idNhom IN (:listId)', parameter: { listId: listNhom.map(nhom => nhom.id) } }, '*', 'idNhom');
        const sortDinhMuc = listNhom.map(nhom => ({ ...nhom, submenus: listDinhMuc.filter(item => item.idNhom == nhom.id) }));
        const listNewNhom = await Promise.all(listNhom.map(nhom => {
            delete nhom.id;
            delete nhom.submenus;
            nhom.nam = newNam;
            return app.model.tccbNhomDanhGiaNhiemVu.create(nhom);
        }));
        let listNewDinhMuc = sortDinhMuc.map((parentItem, index) =>
            parentItem.submenus.map(submenu => {
                delete submenu.id;
                delete submenu.idNhom;
                return { ...submenu, idNhom: listNewNhom[index].id };
            })
        );
        listNewDinhMuc = listNewDinhMuc.reduce((prev, cur) => prev.concat(cur));
        await Promise.all(listNewDinhMuc.map(newDinhMuc => app.model.tccbDinhMucCongViecGvVaNcv.create(newDinhMuc)));
    };
};