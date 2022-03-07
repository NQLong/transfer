// eslint-disable-next-line no-unused-vars
module.exports = app => {

    // const menu = {
    //     parentMenu: app.parentMenu.truyenThong,
    //     menus: {
    //         4003: { title: 'Doanh nghiệp', link: '/user/ero/doanh-nghiep', icon: 'fa-university', backgroundColor: '#ffb300', groupIndex: 1 },
    //     }
    // };
    //
    // const companyMenu = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1631: { title: 'Doanh nghiệp', link: '/user/doanh-nghiep/list', icon: 'fa-briefcase', backgroundColor: '#ffb300', groupIndex: 0 }
    //     }
    // };
    //
    // app.permission.add(
    //     { name: 'dnDoanhNghiep:read', menu },
    //     { name: 'dnDoanhNghiep:write' },
    //     { name: 'dnDoanhNghiep:delete' }
    // );
    //
    // app.get('/user/ero/doanh-nghiep', app.permission.check('dnDoanhNghiep:read'), app.templates.admin);
    // app.get('/user/ero/doanh-nghiep/edit/:doanhNghiepId', app.permission.check('dnDoanhNghiep:read'), app.templates.admin);
    //
    // app.get('/doanh-nghiep/:hiddenShortName', app.templates.home);
    //
    // // APIs Admin Doanh nghiep -----------------------------------------------------------------------------------------
    // app.get('/api/doi-ngoai/doanh-nghiep/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize);
    //     const searchTerm = req.query.condition ? req.query.condition.searchText.toLowerCase() || '' : '';
    //     app.model.dnDoanhNghiep.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
    //         const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
    //         res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
    //     });
    // });
    //
    // app.get('/api/doi-ngoai/doanh-nghiep/all', app.permission.check('dnDoanhNghiep:read'), (req, res) => {
    //     const condition = req.query.condition || {};
    //     app.model.dnDoanhNghiep.getAll(condition, (error, items) => res.send({ error, items }));
    // });
    //
    // app.get('/api/doi-ngoai/doanh-nghiep/item/:id', app.permission.check('user:login'), (req, res) => {
    //     app.model.dnDoanhNghiep.get({ id: req.params.id }, (error, item) => {
    //         app.model.dnDmDoanhNghiep.getAll({ idDoanhNghiep: req.params.id }, (error, loaiDoanhNghiep) => {
    //             item.loaiDoanhNghiep = loaiDoanhNghiep;
    //             res.send({ error, item });
    //         });
    //     });
    // });
    //
    // app.post('/api/doi-ngoai/doanh-nghiep', app.permission.check('dnDoanhNghiep:write'), (req, res) => {
    //     let newData = req.body.item;
    //     if (newData.tenVietTat && newData.tenVietTat != '') {
    //         const hiddenShortName = app.toEngWord(newData.tenVietTat).toLowerCase().replaceAll(' ', '-');
    //         app.model.dnDoanhNghiep.get({ hiddenShortName }, (error, item) => {
    //             if (error) {
    //                 res.send({ error });
    //             } else if (item) {
    //                 res.send({ duplicateShortName: true });
    //             } else {
    //                 newData.hiddenShortName = hiddenShortName;
    //                 newData.confirm = 1;
    //                 app.model.dnDoanhNghiep.create(newData, (error, item) => res.send({ error, item }));
    //             }
    //         });
    //     } else {
    //         app.model.dnDoanhNghiep.create(newData, (error, item) => res.send({ error, item }));
    //     }
    // });
    //
    // app.put('/api/doi-ngoai/doanh-nghiep', app.permission.check('dnDoanhNghiep:write'), async (req, res) => {
    //     const changes = req.body.changes, id = req.body.id;
    //     const updateLoaiDoanhNghiep = (loaiDoanhNghiep) => new Promise((resolve, reject) => {
    //         app.model.dnDmDoanhNghiep.delete({ idDoanhNghiep: id }, (error) => {
    //             if (error) reject(error);
    //             else {
    //                 const newLoaiDoanhNghiep = [];
    //                 const update = (index = 0) => {
    //                     if (index == loaiDoanhNghiep.length) {
    //                         resolve(newLoaiDoanhNghiep);
    //                     } else {
    //                         app.model.dnDmDoanhNghiep.create({ idDanhMuc: loaiDoanhNghiep[index], idDoanhNghiep: id }, (error, item) => {
    //                             if (error || !item) reject(error);
    //                             else {
    //                                 newLoaiDoanhNghiep.push(item);
    //                                 update(index + 1);
    //                             }
    //                         });
    //                     }
    //                 };
    //                 update();
    //             }
    //         });
    //     });
    //
    //     try {
    //         let loaiDoanhNghiep = [];
    //         if (changes.hasOwnProperty('loaiDoanhNghiep')) {
    //             if (changes.loaiDoanhNghiep == 'empty') changes.loaiDoanhNghiep = [];
    //             loaiDoanhNghiep = await updateLoaiDoanhNghiep(changes.loaiDoanhNghiep) || [];
    //             delete changes.loaiDoanhNghiep;
    //         }
    //
    //         if (changes.tenVietTat && changes.tenVietTat != '') {
    //             const hiddenShortName = app.toEngWord(changes.tenVietTat).toLowerCase().replaceAll(' ', '-');
    //             app.model.dnDoanhNghiep.getAll({ hiddenShortName }, (error, items) => {
    //                 if (error) {
    //                     res.send({ error });
    //                 } else if (items && items.length > 1) {
    //                     res.send({ duplicateShortName: true });
    //                 } else if (items && items.length == 1 && items[0].id != req.body.id) {
    //                     res.send({ duplicateShortName: true });
    //                 } else {
    //                     changes.hiddenShortName = hiddenShortName;
    //                     app.model.dnDoanhNghiep.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item: app.clone(item, { loaiDoanhNghiep }) }));
    //                 }
    //             });
    //         } else {
    //             app.model.dnDoanhNghiep.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item: app.clone(item, { loaiDoanhNghiep }) }));
    //         }
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });
    //
    // app.put('/api/doi-ngoai/doanh-nghiep-approval', app.permission.check('dnDoanhNghiep:write'), (req, res) => {
    //     let { id, status } = req.body;
    //     status = status == true || status == 'true';
    //     app.model.dnDoanhNghiep.get({ id }, (error, item) => {
    //         if (error || !item) {
    //             res.send({ error: error || 'Invalid id' });
    //         } else {
    //             let newChanges = {
    //                 confirm: 1
    //             };
    //
    //             if (status) {
    //                 //Approval
    //                 if (item.tenDayDuTemp) newChanges.tenDayDu = item.tenDayDuTemp;
    //                 if (item.tenVietTatTemp) newChanges.tenVietTat = item.tenVietTatTemp;
    //                 if (item.namThanhLapTemp) newChanges.namThanhLap = item.namThanhLapTemp;
    //                 if (item.linhVucKinhDoanhTemp) newChanges.linhVucKinhDoanh = item.linhVucKinhDoanhTemp;
    //                 if (item.quocGiaTemp) newChanges.quocGia = item.quocGiaTemp;
    //                 if (item.emailTemp) newChanges.email = item.emailTemp;
    //                 if (item.websiteTemp) newChanges.website = item.websiteTemp;
    //                 if (item.phoneTemp) newChanges.phone = item.phoneTemp;
    //                 if (item.diaChiTemp) newChanges.diaChi = item.diaChiTemp;
    //                 if (item.theManhTemp) newChanges.theManh = item.theManhTemp;
    //                 if (item.moTaTemp) newChanges.moTa = item.moTaTemp;
    //             }
    //
    //             // Both approval and reject is clear all temp fields
    //             newChanges.tenDayDuTemp = '';
    //             newChanges.tenVietTatTemp = '';
    //             newChanges.namThanhLapTemp = '';
    //             newChanges.linhVucKinhDoanhTemp = '';
    //             newChanges.quocGiaTemp = '';
    //             newChanges.emailTemp = '';
    //             newChanges.websiteTemp = '';
    //             newChanges.phoneTemp = '';
    //             newChanges.diaChiTemp = '';
    //             newChanges.theManhTemp = '';
    //             newChanges.moTaTemp = '';
    //
    //             const handleUpdate = () => {
    //                 //Check image temp is exist move file temp to new directory
    //                 if (item.imageTemp) {
    //                     if (status) {
    //                         const tempImagePath = app.path.join(app.assetPath, item.imageTemp.substring(0, item.imageTemp.indexOf('?t=')));
    //                         const imagePath = '/img/dnDoanhNghiep/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(tempImagePath);
    //                         if (app.fs.existsSync(tempImagePath)) {
    //                             //Has temp image
    //                             app.fs.rename(tempImagePath, app.path.join(app.publicPath, imagePath), error => {
    //                                 if (error) {
    //                                     res.send({ error });
    //                                 } else {
    //                                     newChanges.image = imagePath + '?t=' + (new Date().getTime()).toString().slice(-8);
    //                                     newChanges.imageTemp = '';
    //                                     app.deleteImage(item.image);
    //                                     app.model.dnDoanhNghiep.update({ id }, newChanges, (error, item) => res.send({ error, item }));
    //                                 }
    //                             });
    //                         } else {
    //                             newChanges.imageTemp = '';
    //                             app.model.dnDoanhNghiep.update({ id }, newChanges, (error, item) => {
    //                                 res.send({ error, item });
    //                             });
    //                         }
    //                     } else {
    //                         app.deleteFile(app.path.join(app.assetPath, item.imageTemp));
    //                         newChanges.imageTemp = '';
    //                         app.model.dnDoanhNghiep.update({ id }, newChanges, (error, item) => {
    //                             res.send({ error, item });
    //                         });
    //                     }
    //                 } else {
    //                     app.model.dnDoanhNghiep.update({ id }, newChanges, (error, item) => {
    //                         res.send({ error, item });
    //                     });
    //                 }
    //             };
    //
    //             // Check new hiddenShortName is exist
    //             if (newChanges.tenVietTat && newChanges.tenVietTat != '') {
    //                 const hiddenShortName = app.toEngWord(newChanges.tenVietTat).toLowerCase().replaceAll(' ', '-');
    //                 app.model.dnDoanhNghiep.getAll({ hiddenShortName }, (error, items) => {
    //                     if (error) {
    //                         res.send({ error });
    //                     } else if (items && items.length > 1) {
    //                         res.send({ duplicateShortName: true });
    //                     } else if (items && items.length == 1 && items[0].id != req.body.id) {
    //                         res.send({ duplicateShortName: true });
    //                     } else {
    //                         newChanges.hiddenShortName = hiddenShortName;
    //                         handleUpdate();
    //                     }
    //                 });
    //             } else {
    //                 handleUpdate();
    //             }
    //         }
    //     });
    // });
    //
    // app.delete('/api/doi-ngoai/doanh-nghiep', app.permission.check('dnDoanhNghiep:delete'), (req, res) => {
    //     app.model.dnDoanhNghiepNguoiLienHe.update({ doanhNghiepId: req.body.id }, { doanhNghiepId: null, type: null }, (error) => {
    //         if (error) {
    //             res.send({ error });
    //         } else {
    //             app.model.dnKyKet.update({ donViTiep: req.body.id }, { donViTiep: null, type: null }, (error) => {
    //                 if (error) {
    //                     res.send({ error });
    //                 } else {
    //                     app.model.dnTiepDoan.update({ donViTiep: req.body.id }, { donViTiep: null, type: null }, (error) => {
    //                         if (error) {
    //                             res.send({ error });
    //                         } else {
    //                             app.model.dnDmDoanhNghiep.delete({ idDoanhNghiep: req.body.id }, error => {
    //                                 if (error) {
    //                                     res.send({ error });
    //                                 } else {
    //                                     app.model.dnDoanhNghiep.get({ id: req.body.id }, (error, item) => {
    //                                         if (error) {
    //                                             res.send({ error: 'Không tìm thấy doanh nghiệp' });
    //                                         } else {
    //                                             if (item.image) app.deleteImage(item.image);
    //                                             if (item.imageTemp) {
    //                                                 let imageTemp = app.path.join(app.assetPath, item.imageTemp);
    //                                                 let imageIndex = imageTemp.indexOf('?t=');
    //                                                 if (imageIndex != -1) {
    //                                                     imageTemp = imageTemp.substring(0, imageIndex);
    //                                                 }
    //
    //                                                 if (app.fs.existsSync(imageTemp)) {
    //                                                     app.fs.unlinkSync(imageTemp);
    //                                                 }
    //                                             }
    //                                             app.model.dnDoanhNghiep.delete({ id: req.body.id }, (error) => {
    //                                                 res.send({ error });
    //                                             });
    //                                         }
    //                                     });
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // });
    //
    // // APIs Home page-----------------------------------------------------------------------------------------------------------------
    // app.get('/user/doi-ngoai/doanh-nghiep/item/:id', (req, res) => {
    //     app.model.dnDoanhNghiep.get({ id: req.params.id, kichHoat: 1 }, 'id, quocGia, tenVietTat, tenDayDu, linhVucKinhDoanh, moTa, namThanhLap, theManh, diaChi, email, phone, image, website', 'id', (error, item) => {
    //         if (error || !item) {
    //             res.send({ error });
    //         } else {
    //             if (item.quocGia || item.linhVucKinhDoanh) {
    //                 app.model.dmQuocGia.get({ maCode: item.quocGia }, (error, quocGia) => {
    //                     if ((error || !quocGia) && !item.linhVucKinhDoanh) {
    //                         res.send({ item });
    //                     } else {
    //                         if (quocGia) {
    //                             item.tenQuocGia = JSON.stringify({ vi: quocGia.tenQuocGia, en: quocGia.country });
    //                             if (item.linhVucKinhDoanh) {
    //                                 let linhVucKinhDoanh = item.linhVucKinhDoanh.split(',');
    //                                 app.model.dnDoanhNghiep.getLinhVucKinhDoanh(linhVucKinhDoanh, (error, tenCacLinhVuc) => {
    //                                     item.tenCacLinhVuc = tenCacLinhVuc;
    //                                     res.send({ item });
    //                                 });
    //                             } else {
    //                                 res.send({ item });
    //                             }
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 res.send({ item });
    //             }
    //         }
    //     });
    // });
    //
    // app.get('/user/doi-ngoai/doanh-nghiep/doitac/:hiddenShortName', (req, res) => {
    //     new Promise((resolve, reject) => {
    //         app.model.dnDoanhNghiep.get({ hiddenShortName: req.params.hiddenShortName }, 'id, quocGia, tenVietTat, tenDayDu, linhVucKinhDoanh, moTa, namThanhLap, theManh, diaChi, email, phone, image, website', 'id', (error, item) => {
    //             if (error || !item) {
    //                 reject(error);
    //             } else {
    //                 if (item.quocGia || item.linhVucKinhDoanh) {
    //                     app.model.dmQuocGia.get({ maCode: item.quocGia }, (error, quocGia) => {
    //                         if ((error || !quocGia) && !item.linhVucKinhDoanh) {
    //                             resolve(item);
    //                         } else {
    //                             if (quocGia) {
    //                                 item.tenQuocGia = JSON.stringify({ vi: quocGia.tenQuocGia, en: quocGia.country });
    //                                 if (item.linhVucKinhDoanh) {
    //                                     let linhVucKinhDoanh = item.linhVucKinhDoanh.split(',');
    //                                     app.model.dnDoanhNghiep.getLinhVucKinhDoanh(linhVucKinhDoanh, (error, tenCacLinhVuc) => {
    //                                         item.tenCacLinhVuc = tenCacLinhVuc;
    //                                         resolve(item);
    //                                     });
    //                                 } else {
    //                                     resolve(item);
    //                                 }
    //                             }
    //                         }
    //                     });
    //                 } else {
    //                     resolve(item);
    //                 }
    //             }
    //         });
    //     }).then(company => new Promise((resolve, reject) => {
    //         app.model.dnKyKetDoiTac.getAll({ doanhNghiepId: company.id }, (error, items) => {
    //             if (error) {
    //                 reject(error);
    //             } else {
    //                 if (items.length) {
    //                     const condition = {
    //                         statement: 'id IN (:ids) AND kichHoat=1',
    //                         parameter: {
    //                             ids: items.map(item => item.idKyKet)
    //                         }
    //                     };
    //
    //                     app.model.dnKyKet.getAll(condition, (error, items) => {
    //                         company.listKyKet = !error && items ? items : [];
    //                         resolve(company);
    //                     });
    //                 } else {
    //                     company.listKyKet = [];
    //                     resolve(company);
    //                 }
    //             }
    //         });
    //     })).then(company => {
    //         app.model.dnTiepDoan.getAll({ donViTiep: company.id }, (error, items) => {
    //             company.listTiepDoan = !error && items ? items : [];
    //             res.send({ item: company });
    //         });
    //     }).catch(error => res.send({ error }));
    // });
    //
    // app.get('/user/doi-ngoai/doanh-nghiep/all', (req, res) => {
    //     app.model.dnDoanhNghiep.searchAll(req.query.loaiThanhPhan, 1, '', (error, result) => {
    //         res.send({ error, items: result && result.rows || [] });
    //     });
    // });
    // // API dai dien doanh nghiep --------------------------------------------------------------------------------------------------------------------
    // app.get('/api/doi-ngoai/dai-dien-doanh-nghiep/page/:pageNumber/:pageSize', app.permission.check('dnDoanhNghiep:read'), (req, res) => {
    //     let pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = { statement: null, parameter: {} };
    //     if (req.query.condition) {
    //         if (typeof (req.query.condition) == 'object') {
    //             if (req.query.condition.searchText || req.query.condition.searchText == '') {
    //                 condition = {
    //                     statement: 'email LIKE :searchText',
    //                     parameter: { searchText: `%${req.query.condition.searchText.toLowerCase()}%` }
    //                 };
    //             }
    //         } else {
    //             condition = {
    //                 statement: 'email LIKE :searchText',
    //                 parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
    //             };
    //         }
    //     }
    //
    //     condition.statement = condition.statement && condition.statement.length > 0 ? `(${condition.statement}) AND isCompany=1` : 'isCompany=1';
    //
    //     app.model.fwUser.getPage(pageNumber, pageSize, condition, 'email, active, image, isCompany, lastName, firstName', 'email ASC', (error, page) => {
    //         if (error) {
    //             res.send({ error });
    //         } else {
    //             const ownerEmail = (page.list || []).map(item => item.email);
    //             const doanhNghiepCondition = {
    //                 statement: 'ownerEmail IN(:ownerEmail)',
    //                 parameter: { ownerEmail }
    //             };
    //             app.model.dnDoanhNghiep.getAll(doanhNghiepCondition, 'id, tenDayDu, ownerEmail', '', (error, items) => {
    //                 if (error || items.length == 0 || page.list.length == 0) {
    //                     res.send({ page });
    //                 } else {
    //                     const userMapper = {};
    //                     (page.list || []).forEach(item => userMapper[item.email] = { ...item, companies: [] });
    //                     items.forEach(item => {
    //                         item.ownerEmail && userMapper[item.ownerEmail] && userMapper[item.ownerEmail].companies.push(item);
    //                     });
    //                     page.list = Object.values(userMapper);
    //                     res.send({ error, page });
    //                 }
    //             });
    //         }
    //     });
    // });
    //
    // app.post('/api/doi-ngoai/dai-dien-doanh-nghiep', app.permission.check('dnDoanhNghiep:write'), async (req, res) => {
    //     let changes = req.body.changes, companies = req.body.companies;
    //     const createUser = () => new Promise((resolve, reject) => {
    //         app.model.fwUser.get({ email: changes.email }, (error, item) => {
    //             if (error) {
    //                 reject(error);
    //             } else if (item) {
    //                 app.model.fwUser.update({ email: item.email }, { isCompany: 1 }, (error, item) => {
    //                     error ? reject(error) : resolve(item);
    //                 });
    //             } else {
    //                 app.model.fwUser.create({ ...changes, isCompany: 1 }, (error, item) => {
    //                     error ? reject(error) : resolve(item);
    //                 });
    //             }
    //         });
    //     });
    //
    //     const updateCompanies = (condition, changes) => new Promise((resolve, reject) => {
    //         app.model.dnDoanhNghiep.update(condition, changes, (error) => {
    //             error ? reject(error) : resolve();
    //         });
    //     });
    //
    //     try {
    //         const user = await createUser();
    //         if (companies && companies != 'empty') {
    //             await updateCompanies({
    //                 statement: 'id IN (:list)',
    //                 parameter: { list: companies }
    //             }, { ownerEmail: user.email });
    //         }
    //         res.send({ item: user });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });
    //
    // app.put('/api/doi-ngoai/dai-dien-doanh-nghiep', app.permission.check('dnDoanhNghiep:write'), async (req, res) => {
    //     let email = req.body.email, changes = req.body.changes, companies = req.body.companies;
    //     const checkUser = () => new Promise((resolve, reject) => {
    //         if (changes.email != email) {
    //             app.model.fwUser.get({ email: changes.email }, (error, item) => {
    //                 if (error) {
    //                     reject(error);
    //                 } else if (item) {
    //                     reject('Email này đã được sử dụng!');
    //                 } else {
    //                     resolve();
    //                 }
    //             });
    //         } else {
    //             resolve();
    //         }
    //     });
    //
    //     const updateUser = () => new Promise((resolve, reject) => {
    //         delete changes.isStudent;
    //         delete changes.isStaff;
    //         delete changes.isCompany;
    //         delete changes.password;
    //         app.model.fwUser.update({ email, isCompany: 1 }, changes, (error, item) => {
    //             if (error) reject(error);
    //             else resolve(item);
    //         });
    //     });
    //
    //     const getCompanies = (ownerEmail) => new Promise((resolve, reject) => {
    //         app.model.dnDoanhNghiep.getAll({ ownerEmail }, (error, items) => {
    //             if (error) {
    //                 reject(error);
    //             } else {
    //                 resolve(items || []);
    //             }
    //         });
    //     });
    //
    //     const updateCompanies = (condition, changes) => new Promise((resolve, reject) => {
    //         app.model.dnDoanhNghiep.update(condition, changes, (error) => {
    //             error ? reject(error) : resolve();
    //         });
    //     });
    //
    //     try {
    //         if (changes.password) {
    //             changes.password = app.model.fwUser.hashPassword(changes.password);
    //             app.model.fwUser.update({ email, isCompany: 1 }, changes, (error, item) => {
    //                 res.send({ error, item });
    //             });
    //         } else {
    //             await checkUser();
    //             const user = await updateUser();
    //             if (companies) {
    //                 if (companies == 'empty') companies = [];
    //                 const currentCompanies = await getCompanies(email);
    //                 if (email != changes.email) {
    //                     const additionCompanies = await getCompanies(user.email);
    //                     currentCompanies.push(...additionCompanies);
    //                 }
    //                 await updateCompanies({
    //                     statement: 'id IN (:list)',
    //                     parameter: { list: currentCompanies.map(item => item.id) }
    //                 }, { ownerEmail: '' });
    //                 if (companies.length) {
    //                     await updateCompanies({
    //                         statement: 'id IN (:list)',
    //                         parameter: { list: companies }
    //                     }, { ownerEmail: user.email });
    //                 }
    //             }
    //             res.send({ item: user });
    //         }
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });
    //
    // app.delete('/api/doi-ngoai/dai-dien-doanh-nghiep', app.permission.check('dnDoanhNghiep:write'), async (req, res) => {
    //     let email = req.body.email;
    //     const removeUser = () => new Promise((resolve, reject) => {
    //         app.model.fwUser.update({ email }, { isCompany: 0 }, (error, item) => {
    //             error ? reject(error) : resolve(item);
    //         });
    //     });
    //
    //     const updateCompanies = (condition, changes) => new Promise((resolve, reject) => {
    //         app.model.dnDoanhNghiep.update(condition, changes, (error) => {
    //             error ? reject(error) : resolve();
    //         });
    //     });
    //
    //     try {
    //         const user = await removeUser();
    //         await updateCompanies({ ownerEmail: user.email }, { ownerEmail: '' });
    //         res.end();
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });
    //
    // // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    // app.createFolder(app.path.join(app.publicPath, 'img', 'dnDoanhNghiep'));
    //
    // app.createFolder(app.path.join(app.assetPath, 'ero'));
    // app.createFolder(app.path.join(app.assetPath, 'ero', 'dnDoanhNghiep'));
    // app.createFolder(app.path.join(app.assetPath, 'ero', 'dnDoanhNghiep', 'imageTemp'));
    //
    // const uploadDoanhNghiepLogo = (req, fields, files, param, done) => {
    //     if (fields.userData && fields.userData[0].startsWith('dnDoanhNghiep:') && files.doanhNghiepLogo && files.doanhNghiepLogo.length > 0) {
    //         app.uploadComponentImage(req, 'dnDoanhNghiep', app.model.dnDoanhNghiep, { id: fields.userData[0].substring(14) }, files.doanhNghiepLogo[0].path, done);
    //     }
    // };
    //
    // app.uploadHooks.add('uploadDoanhNghiepLogoByAdmin', (req, fields, files, params, done) => {
    //     app.permission.has(req, () => uploadDoanhNghiepLogo(req, fields, files, params, done), done, 'dnDoanhNghiep:write');
    // });
    //
    // app.uploadHooks.add('uploadDnDoanhNghiepCkEditorByAdmin', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => app.uploadCkEditorImage('dnDoanhNghiep', fields, files, params, done), done, 'dnDoanhNghiep:write'));
    //
    // const uploadDoanhNghiepLogoTemp = (req, fields, files, param, done) => {
    //     if (fields.userData && fields.userData[0].startsWith('dnDoanhNghiepTemp:') && files.doanhNghiepLogoTemp && files.doanhNghiepLogoTemp.length > 0) {
    //         const srcPath = files.doanhNghiepLogoTemp[0].path;
    //         const id = Number(fields.userData[0].substring(18));
    //         app.model.dnDoanhNghiep.get({ id }, (error, dataItem) => {
    //             if (error || dataItem == null) {
    //                 done({ error: 'Invalid Id Or you don\'t have permission!' });
    //             } else {
    //                 if (dataItem.imageTemp) {
    //                     app.deleteFile(app.path.join(app.assetPath, dataItem.imageTemp));
    //                 }
    //                 let imageTemp = 'ero/dnDoanhNghiep/imageTemp/' + (new Date().getTime()).toString().slice(-8) + app.path.extname(srcPath);
    //                 app.fs.rename(srcPath, app.path.join(app.assetPath, imageTemp), error => {
    //                     if (error) {
    //                         done({ error });
    //                     } else {
    //                         imageTemp += '?t=' + (new Date().getTime()).toString().slice(-8);
    //                         app.model.dnDoanhNghiep.update({ id }, { imageTemp, confirm: 0 }, (error, item) => {
    //                             done({ error, item, image: `/api/doi-ngoai/owner-doanh-nghiep/image-temp/${id}` });
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // };
    //
    // app.uploadHooks.add('uploadDoanhNghiepLogoTemp', (req, fields, files, params, done) => {
    //     app.permission.has(req, () => uploadDoanhNghiepLogoTemp(req, fields, files, params, done), done, 'company:login');
    // });
    //
    // const uploadUserImage = (req, fields, files, params, done) => {
    //     if (fields.userData && fields.userData[0].startsWith('dnDoanhNghiep:') && files.NguoiDaiDienImage && files.NguoiDaiDienImage.length > 0) {
    //         console.log('Hook: UserImage => doanh nghiep image upload');
    //         let email = fields.userData[0].substring('dnDoanhNghiep:'.length),
    //             srcPath = files.NguoiDaiDienImage[0].path, filename = app.path.basename(srcPath);
    //         app.model.fwUser.get({ email, isCompany: 1 }, (error, user) => {
    //             if (error || user == null) {
    //                 done({ error: error ? error : 'Invalid user!' });
    //             } else {
    //                 app.deleteImage(user.image);
    //                 app.fs.rename(srcPath,app.path.join(app.publicPath, '/img/user/', filename), error => {
    //                     if (error) {
    //                         done({ error });
    //                     } else {
    //                         filename = '/img/user/' + filename;
    //                         app.model.fwUser.update({ email }, { image: filename }, error => done({ error, image: filename }));
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // };
    //
    // app.uploadHooks.add('DnDaiDienDoanhNghiepImage', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => uploadUserImage(req, fields, files, params, done), done, 'dnDoanhNghiep:write'));
};