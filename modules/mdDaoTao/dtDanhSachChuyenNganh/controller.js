module.exports = app => {
     const menu = {
          parentMenu: app.parentMenu.daoTao,
          menus: {
               7005: {
                    title: 'Danh sách chuyên ngành', subTitle: 'Chuyên ngành của Khoa mở trong CTĐT', groupIndex: 0,
                    icon: 'fa-sitemap', backgroundColor: '#5C4732',
                    link: '/user/dao-tao/danh-sach-chuyen-nganh'
               },
          },
     };

     app.permission.add(
          { name: 'dtDanhSachChuyenNganh:read', menu },
          { name: 'manager:read', menu },
          { name: 'dtDanhSachChuyenNganh:write' },
          { name: 'dtDanhSachChuyenNganh:delete' },
     );

     app.get('/user/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtDanhSachChuyenNganh:read', 'manager:read'), app.templates.admin);

     const checkDaoTaoPermission = (req, res, next) => app.isDebug ? next() : app.permission.orCheck('dtDanhSachChuyenNganh:read', 'manager:read')(req, res, next);

     //APIs -------------------------------------------------------------------------------------------------------
     app.get('/api/dao-tao/danh-sach-chuyen-nganh/page/:pageNumber/:pageSize', checkDaoTaoPermission, (req, res) => {
          let pageNumber = parseInt(req.params.pageNumber),
               pageSize = parseInt(req.params.pageSize),
               donVi = req.query.donVi || 'all',
               namHoc = req.query.namHoc ? parseInt(req.query.namHoc) : null,
               searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
               statement = 'lower(ten) LIKE :searchTerm',
               parameter = { searchTerm };
          if (donVi != 'all') {
               parameter.donVi = parseInt(donVi);
               parameter.namHoc = namHoc;
               statement = 'khoa = :donVi AND (:namHoc IS NULL OR (namHoc = :namHoc)) AND lower(ten) LIKE :searchTerm';
          }
          let condition = { statement, parameter };
          app.model.dtDanhSachChuyenNganh.getPage(pageNumber, pageSize, condition, '*', 'khoa', (error, page) => {
               page.pageCondition = {
                    searchTerm, donVi, nam: namHoc
               };
               res.send({ error, page });
          });
     });

     app.post('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write', 'manager:write'), (req, res) => {
          app.model.dtDanhSachChuyenNganh.create(req.body.data, (error, item) => res.send({ error, item }));
     });

     app.put('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:write', 'manager:write'), (req, res) => {
          const changes = req.body.changes || {};
          app.model.dtDanhSachChuyenNganh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
     });

     app.delete('/api/dao-tao/danh-sach-chuyen-nganh', app.permission.orCheck('dtNganhDaoTao:delete', 'manager:write'), (req, res) => {
          app.model.dtDanhSachChuyenNganh.delete({ id: req.body.id }, errors => res.send({ errors }));
     });

};

