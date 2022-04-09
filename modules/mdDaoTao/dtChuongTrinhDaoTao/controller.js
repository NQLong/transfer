module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      7006: {
        title: 'Chương trình đào tạo', groupIndex: 1,
        link: '/user/pdt/chuong-trinh-dao-tao', icon: 'fa-university', backgroundColor: '#8ca474'
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

  app.get('/user/pdt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), app.templates.admin);
  app.get('/user/pdt/chuong-trinh-dao-tao/:maDonVi/:namDaoTao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), app.templates.admin);
  app.get('/user/pdt/chuong-trinh-dao-tao/new', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), app.templates.admin);


  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/pdt/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    let pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      donVi = req.session.user ? req.session.user.maDonVi : null,
      searchTerm = typeof req.query.searchTerm === 'string' ? `%${req.query.searchTerm.toLowerCase()}%` : '',
      statement = 'lower(namDaoTao) LIKE :searchTerm',
      parameter = { searchTerm };
    if (req.session.user.permissions.exists(['manager:read'])) donVi = null;
    if (donVi) {
      statement = 'maBoMon = :donVi AND lower(namDaoTao) LIKE :searchTerm';
      parameter.donVi = parseInt(donVi);
    }
    let condition = { statement, parameter };
    app.model.dtChuongTrinhDaoTao.getDistinct(pageNumber, pageSize, condition, 'maBoMon, namDaoTao', 'maBoMon', (error, page) => {
      page.pageCondition = {
        searchTerm
      };
      res.send({ error, page });
    });
  });

  app.get('/api/pdt/chuong-trinh-dao-tao/:maDonVi/:namDaoTao', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), (req, res) => {
    const condition = req.query.condition || {};
    Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
    app.model.dtChuongTrinhDaoTao.getAll(condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
  });

  app.post('/api/pdt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.post('/api/pdt/chuong-trinh-dao-tao/multiple', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
    const { data } = req.body;
    const { items, namDaoTao, maBoMon } = data;
    const dataImported = [];
    const handleCreate = index => {
      if (index >= items.length) res.send({ items: dataImported });
      else
        app.model.dtChuongTrinhDaoTao.get({ id: items[index].id }, (error, item) => {
          const currentData = { ...items[index], ...{ namDaoTao, maBoMon } };
          delete currentData['id'];
          if (error) res.send({ error });
          else if (item) {
            app.model.dtChuongTrinhDaoTao.update({ id: items[index].id }, currentData, (error, item) => {
              if (error) res.send({ error });
              else {
                dataImported.push(item);
              }
            });
            handleCreate(index + 1);
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
    handleCreate(0);
  });

  app.put('/api/pdt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/pdt/chuong-trinh-dao-tao', app.permission.orCheck('dtChuongTrinhDaoTao:delete', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};