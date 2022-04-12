module.exports = app => {
     const menu = {
          parentMenu: app.parentMenu.tccb,
          menus: {
               3016: { title: 'Quá trình đào tạo, bồi dưỡng', link: '/user/tccb/qua-trinh/dao-tao', icon: 'fa-podcast', backgroundColor: '#635118', groupIndex: 5 },
          },
     };

     const menuStaff = {
          parentMenu: app.parentMenu.user,
          menus: {
               1015: { title: 'Đào tạo, bồi dưỡng', subTitle: 'Bằng cấp, chứng nhận, chứng chỉ', link: '/user/qua-trinh-dao-tao-boi-duong', icon: 'fa-podcast', color: '#000000', backgroundColor: '#7ae6e6', groupIndex: 0 },
          },
     };

     app.permission.add(
          { name: 'staff:login', menu: menuStaff },
          { name: 'qtDaoTao:read', menu },
          { name: 'qtDaoTao:write' },
          { name: 'qtDaoTao:delete' },
     );
     app.get('/user/tccb/qua-trinh/dao-tao/:stt', app.permission.check('qtDaoTao:read'), app.templates.admin);
     app.get('/user/tccb/qua-trinh/dao-tao', app.permission.check('qtDaoTao:read'), app.templates.admin);
     app.get('/user/tccb/qua-trinh/dao-tao/:ma', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
     app.get('/user/qua-trinh-dao-tao-boi-duong', app.permission.check('staff:login'), app.templates.admin);
     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
     const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

     app.get('/api/qua-trinh/dao-tao/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
          const pageNumber = parseInt(req.params.pageNumber),
               pageSize = parseInt(req.params.pageSize),
               searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
          const { fromYear, toYear, listShcc, listDv, listLoaiBang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
          app.model.qtDaoTao.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, listLoaiBang, searchTerm, (error, page) => {
               if (error || page == null) {
                    res.send({ error });
               } else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
               }
          });
     });

     app.get('/api/tccb/qua-trinh/dao-tao/group/page/:pageNumber/:pageSize', app.permission.check('qtDaoTao:read'), (req, res) => {
          const pageNumber = parseInt(req.params.pageNumber),
               pageSize = parseInt(req.params.pageSize),
               searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
          const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
          app.model.qtDaoTao.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
               if (error || page == null) {
                    res.send({ error });
               } else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                    const pageCondition = searchTerm;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
               }
          });
     });

     app.post('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
          app.model.qtDaoTao.create(req.body.data, (error, item) => res.send({ error, item })));

     app.put('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
          app.model.qtDaoTao.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

     app.delete('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
          app.model.qtDaoTao.delete({ id: req.body.id }, (error) => res.send(error)));

     app.post('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
          if (req.body.data && req.session.user) {
               const data = req.body.data;
               app.model.qtDaoTao.create(data, (error, item) => res.send({ error, item }));
          } else {
               res.send({ error: 'Invalid parameter!' });
          }
     });

     app.put('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
          if (req.body.changes && req.session.user) {
               app.model.qtDaoTao.get({ id: req.body.id }, (error, item) => {
                    if (error || item == null) {
                         res.send({ error: 'Not found!' });
                    } else {
                         app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                              if (e || r == null) res.send({ error: 'Not found!' }); else {
                                   const changes = req.body.changes;
                                   app.model.qtDaoTao.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                              }
                         });
                    }
               });
          } else {
               res.send({ error: 'Invalid parameter!' });
          }
     });

     app.delete('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
          if (req.session.user) {
               app.model.qtDaoTao.get({ id: req.body.id }, (error, item) => {
                    if (error || item == null) {
                         res.send({ error: 'Not found!' });
                    } else {
                         app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                              if (e || r == null) res.send({ error: 'Not found!' }); else {
                                   app.model.qtDaoTao.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                              }
                         });
                    }
               });
          } else {
               res.send({ error: 'Invalid parameter!' });
          }
     });

     app.get('/api/qua-trinh/dao-tao/download-excel/:listShcc/:listDv/:fromYear/:toYear/:listLoaiBang', app.permission.check('qtDaoTao:read'), (req, res) => {
          let { listShcc, listDv, fromYear, toYear, listLoaiBang } = req.params ? req.params : { listShcc: null, listDv: null, fromYear: null, toYear: null, listLoaiBang: null };
          if (listShcc == 'null') listShcc = null;
          if (listDv == 'null') listDv = null;
          if (fromYear == 'null') fromYear = null;
          if (toYear == 'null') toYear = null;
          if (listLoaiBang == 'null') listLoaiBang = null;
          app.model.qtDaoTao.download(listShcc, listDv, fromYear, toYear, listLoaiBang, (err, result) => {
               if (err || !result) {
                    res.send({ err });
               } else {
                    const workbook = app.excel.create(),
                         worksheet = workbook.addWorksheet('daotaoboiduong');
                    new Promise(resolve => {
                         let cells = [
                              { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                              { cell: 'B1', value: 'MÃ SỐ CÁN BỘ', bold: true, border: '1234' },
                              { cell: 'C1', value: 'HỌ', bold: true, border: '1234' },
                              { cell: 'D1', value: 'TÊN', bold: true, border: '1234' },
                              { cell: 'E1', value: 'NỮ', bold: true, border: '1234' },
                              { cell: 'F1', value: 'NGÀY THÁNG NĂM SINH', bold: true, border: '1234' },
                              { cell: 'G1', value: 'LOẠI BẰNG', bold: true, border: '1234' },
                              { cell: 'H1', value: 'TRÌNH ĐỘ/KẾT QUẢ', bold: true, border: '1234' },
                              { cell: 'I1', value: 'CHUYÊN NGÀNH', bold: true, border: '1234' },
                              { cell: 'J1', value: 'TÊN CƠ SỞ ĐÀO TẠO', bold: true, border: '1234' },
                              { cell: 'K1', value: 'NGÀY BẮT ĐẦU', bold: true, border: '1234' },
                              { cell: 'L1', value: 'NGÀY KẾT THÚC', bold: true, border: '1234' },
                              { cell: 'M1', value: 'HÌNH THỨC', bold: true, border: '1234' },
                              { cell: 'N1', value: 'KINH PHÍ', bold: true, border: '1234' },
                         ];
                         result.rows.forEach((item, index) => {
                              cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                              cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.shcc });
                              cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.hoCanBo });
                              cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenCanBo });
                              cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.gioiTinhCanBo == '02' ? 'x' : '' });
                              cells.push({ cell: 'F' + (index + 2), alignment: 'left', border: '1234', value: item.ngaySinhCanBo ? app.date.dateTimeFormat(new Date(item.ngaySinhCanBo), 'dd/mm/yyyy') : '' });
                              cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenLoaiBangCap });
                              cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenTrinhDo });
                              cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.chuyenNganh });
                              cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenCoSoDaoTao });
                              cells.push({ cell: 'K' + (index + 2), alignment: 'left', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                              cells.push({ cell: 'L' + (index + 2), alignment: 'left', border: '1234', value: (item.ketThuc != null && item.ketThuc != 0) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                              cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.tenHinhThuc });
                              cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.kinhPhi });
                         });
                         resolve(cells);
                    }).then((cells) => {
                         app.excel.write(worksheet, cells);
                         app.excel.attachment(workbook, res, 'daotaoboiduong.xlsx');
                    }).catch((error) => {
                         res.send({ error });
                    });
               }
          });
     });
};