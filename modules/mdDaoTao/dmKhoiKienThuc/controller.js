module.exports = app => {
     const menu = {
          parentMenu: app.parentMenu.daoTao,
          menus: {
               9006: {
                    title: 'Danh sách Khối kiến thức', icon: 'fa-crosshairs', link: '/user/dao-tao/khoi-kien-thuc', groupIndex: '2', backgroundColor: '#1B9CC6'
               }
          }
     };
     app.permission.add(
          { name: 'dmKhoiKienThuc:read', menu },
          { name: 'manager:read', menu },
          { name: 'dmKhoiKienThuc:write' },
          { name: 'dmKhoiKienThuc:delete' }
     );

     app.get('/user/dao-tao/khoi-kien-thuc', app.permission.orCheck('dmKhoiKienThuc:read', 'manager:read'), app.templates.admin);

     //APIs----------------------------------------------------------------------------------------------------------------------------------
     app.get('/api/dao-tao/khoi-kien-thuc/page/:pageNumber/:pageSize', app.permission.orCheck('dmKhoiKienThuc:read', 'manager:read'), (req, res) => {
          let pageNumber = parseInt(req.params.pageNumber),
               pageSize = parseInt(req.params.pageSize),
               searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
          app.model.dmKhoiKienThuc.searchPage(pageNumber, pageSize, searchTerm, (error, result) => {
               if (error) res.send({ error });
               else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
               }
          });
     });

     app.get('/api/dao-tao/khoi-kien-thuc/all', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
          app.model.dmKhoiKienThuc.getAll((error, items) => res.send({ error, items }));
     });

     app.get('/api/dao-tao/khoi-kien-thuc/item/:ma', app.permission.orCheck('dmKhoiKienThuc:read', 'manager:read'), (req, res) => {
          app.model.dmKhoiKienThuc.get({ ma: req.params.ma }, (error, item) => {
               res.send({ error, item });
          });
     });

     app.post('/api/dao-tao/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
          app.model.dmKhoiKienThuc.create(req.body.data, (error, item) => res.send({ error, item })));

     app.put('/api/dao-tao/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
          app.model.dmKhoiKienThuc.update({ ma: req.body.ma }, req.body.changes || {}, (error, item) => res.send({ error, item })));

     app.delete('/api/dao-tao/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:delete'), (req, res) =>
          app.model.dmKhoiKienThuc.delete({ ma: req.body.ma }, error => res.send({ error })));
};