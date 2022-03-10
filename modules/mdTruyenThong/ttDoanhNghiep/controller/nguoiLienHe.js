// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.truyenThong,
    //     menus: {
    //         4012: { title: 'Người liên hệ', link: '/user/ero/nguoi-lien-he', icon: 'fa-smile-o', backgroundColor: '#a5d6a7', groupIndex: 1 },
    //     },
    // };
    // app.permission.add(
    //     { name: 'dnNguoiLienHe:read', menu },
    //     { name: 'dnNguoiLienHe:write' },
    //     { name: 'dnNguoiLienHe:delete' },
    // );
    //
    // app.get('/user/ero/nguoi-lien-he', app.permission.check('dnNguoiLienHe:read'), app.templates.admin);
    //
    // // APIs Người liên hệ -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/doi-ngoai/nguoi-lien-he/page/:pageNumber/:pageSize', app.permission.check('dnNguoiLienHe:read'), (req, res) => {
    //     let pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize);
    //     const searchTerm = req.query.condition && req.query.condition.searchText || '';
    //     app.model.dnDoanhNghiepNguoiLienHe.searchPage(pageNumber, pageSize, searchTerm, null, (error, page) => {
    //         if (error || page == null) {
    //             res.send({ error });
    //         } else {
    //             const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //             res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
    //         }
    //     });
    // });
    //
    // app.get('/api/doi-ngoai/nguoi-lien-he/all', app.permission.check('dnNguoiLienHe:read'), (req, res) => {
    //     const condition = req.query.condition || {};
    //     app.model.dnDoanhNghiepNguoiLienHe.getAll(condition, (error, items) => res.send({ error, items }));
    // });
    //
    // app.get('/api/doi-ngoai/nguoi-lien-he/item/:id', app.permission.check('dnNguoiLienHe:read'), (req, res) => {
    //     app.model.dnDoanhNghiepNguoiLienHe.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    // });
    //
    // app.post('/api/doi-ngoai/nguoi-lien-he', app.permission.check('dnNguoiLienHe:write'), (req, res) => {
    //     let newData = req.body.item;
    //     if (newData.email) {
    //         app.model.dnDoanhNghiepNguoiLienHe.get({ email: newData.email }, (error, item) => {
    //             if (error) {
    //                 res.send({ error });
    //             } else if (item) {
    //                 res.send({ duplicateEmail: true });
    //             } else {
    //                 app.model.dnDoanhNghiepNguoiLienHe.create(newData, (error, item) => res.send({ error, item }));
    //             }
    //         });
    //     } else {
    //         app.model.dnDoanhNghiepNguoiLienHe.create(newData, (error, item) => res.send({ error, item }));
    //     }
    // });
    //
    // app.put('/api/doi-ngoai/nguoi-lien-he', app.permission.check('dnNguoiLienHe:write'), (req, res) => {
    //     const changes = req.body.changes;
    //     if (changes.email) {
    //         app.model.dnDoanhNghiepNguoiLienHe.getAll({ email: changes.email }, (error, items) => {
    //             if (error) {
    //                 res.send({ error });
    //             } else if (items && items.length > 1) {
    //                 res.send({ duplicateEmail: true });
    //             } else if (items && items.length == 1 && items[0].id != req.body.id) {
    //                 res.send({ duplicateEmail: true });
    //             } else {
    //                 app.model.dnDoanhNghiepNguoiLienHe.update({ id: req.body.id }, changes, (error, items) => res.send({ error, items }));
    //             }
    //         });
    //     } else {
    //         app.model.dnDoanhNghiepNguoiLienHe.update({ id: req.body.id }, changes, (error, items) => res.send({ error, items }));
    //     }
    // });
    //
    // app.delete('/api/doi-ngoai/nguoi-lien-he', app.permission.check('dnNguoiLienHe:delete'), (req, res) => {
    //     let listError = [];
    //     app.model.dnTiepDoanNguoiThamDuKhach.getAll({ nguoiLienHeId: req.body.id }, (error, items) => {
    //         if (error) {
    //             res.send({ error });
    //         } else {
    //             console.log(items);
    //             const deleteNguoiThamDuKhach = (index = 0) => {
    //                 if (index >= items.length) {
    //                     app.model.dnDoanhNghiepNguoiLienHe.delete({ id: req.body.id }, errors => {
    //                         listError.push(errors);
    //                         res.send({ errors: listError });
    //                     });
    //                 } else {
    //                     app.model.dnTiepDoanNguoiThamDuKhach.delete({ tiepDoanId: items[index].tiepDoanId, nguoiLienHeId: req.body.id }, error => listError.push[error]);
    //                 }
    //             };
    //             deleteNguoiThamDuKhach();
    //         }
    //     });
    // });
};