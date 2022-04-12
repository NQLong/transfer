module.exports = app => {
     const menu = {
          parentMenu: app.parentMenu.daoTao,
          menus: {
               7006: {
                    title: 'Chương trình đào tạo', groupIndex: 1,
                    link: '/user/dao-tao/chuong-trinh-dao-tao', icon: 'fa-university', backgroundColor: '#8ca474'
               },
          },
     };
     app.permission.add(
          { name: 'dtChuongTrinhDaoTao:read', menu },
          { name: 'dtChuongTrinhDaoTao:readAll', menu },
          { name: 'manager:read', menu },
          { name: 'dtChuongTrinhDaoTao:write' },
          { name: 'dtChuongTrinhDaoTao:delete' },
     );

     app.get('/user/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), app.templates.admin);
     app.get('/user/dao-tao/chuong-trinh-dao-tao/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), app.templates.admin);
     app.get('/user/dao-tao/chuong-trinh-dao-tao/new', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), app.templates.admin);


     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
     app.get('/api/dao-tao/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
          let pageNumber = parseInt(req.params.pageNumber),
               pageSize = parseInt(req.params.pageSize),
               searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
          app.model.dtKhungDaoTao.searchPage(pageNumber, pageSize, searchTerm, (error, result) => {
               if (error) res.send({ error });
               else {
                    const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                    res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
               }
          });
     });

     app.get('/api/dao-tao/chuong-trinh-dao-tao/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), (req, res) => {
          const condition = req.query.condition || {};
          Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
          app.model.dtChuongTrinhDaoTao.getAll(condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
     });

     app.get('/api/dao-tao/khung-dao-tao/:ma', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), (req, res) => {
          const condition = req.query.condition || {};
          Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
          app.model.dtKhungDaoTao.get(condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
     });

     app.post('/api/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
          app.model.dtChuongTrinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
     });

     app.post('/api/dao-tao/chuong-trinh-dao-tao/multiple', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
          const { data } = req.body;
          const { items, namDaoTao, maKhoa, id: idKhungDt } = data;
          const dataImported = [];

          const handleCreate = (index, idKhungDt) => {
               if (index >= items.length) res.send({ items: dataImported });
               else
                    app.model.dtChuongTrinhDaoTao.get({ id: items[index].id }, (error, item) => {
                         const currentData = { ...items[index], ...{ maKhungDaoTao: idKhungDt } };
                         delete currentData['id'];
                         if (error) res.send({ error });
                         else if (item) {
                              app.model.dtChuongTrinhDaoTao.update({ id: items[index].id }, currentData, (error, item) => {
                                   if (error) res.send({ error });
                                   else {
                                        dataImported.push(item);
                                   }
                              });
                              handleCreate(index + 1, idKhungDt);
                         }
                         else {
                              app.model.dtChuongTrinhDaoTao.create(currentData, (error, item) => {
                                   if (error) res.send({ error });
                                   else {
                                        dataImported.push(item);
                                        handleCreate(index + 1);
                                   }
                              });
                         }
                    });
          };
          if (idKhungDt > 0) {
               app.model.dtKhungDaoTao.get({ id: idKhungDt }, (error, item) => {
                    if (error) res.send({ error });
                    else if (item) {
                         const { id: idKhungDt, namDaoTao: dbNamDaoTao, maKhoa: dbMaKhoa } = item;
                         const changes = {};
                         if (namDaoTao != dbNamDaoTao) {
                              changes[namDaoTao] = namDaoTao;
                         }
                         if (maKhoa != dbMaKhoa) {
                              changes[maKhoa] = maKhoa;
                         }
                         app.model.dtKhungDaoTao.update({ id: idKhungDt }, changes, () => { });
                         handleCreate(0, idKhungDt);
                    }
                    else {
                         app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                              if (error) res.send({ error });
                              else {
                                   const { id: idKhungDt } = item;
                                   handleCreate(0, idKhungDt);
                              }
                         });
                    }
               });
          } else {
               app.model.dtKhungDaoTao.create({ namDaoTao, maKhoa }, (error, item) => {
                    if (error) res.send({ error });
                    else {
                         const { id: idKhungDt } = item;
                         handleCreate(0, idKhungDt);
                    }
               });
          }

     });

     app.put('/api/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
          app.model.dtChuongTrinhDaoTao.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
     });

     app.delete('/api/dao-tao/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:delete', 'manager:write'), (req, res) => {
          app.model.dtChuongTrinhDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
     });
};