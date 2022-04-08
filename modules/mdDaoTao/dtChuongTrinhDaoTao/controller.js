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
  app.get('/user/pdt/chuong-trinh-dao-tao/:khoa/:id', app.permission.orCheck('dtChuongTrinhDaoTao:read', 'dtChuongTrinhDaoTao:readAll', 'manager:read'), app.templates.admin);


  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/pdt/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    app.model.dtChuongTrinhDaoTao.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
      if (error || page == null) {
        res.send({ error });
      } else {
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
      }
    });
  });

  app.post('/api/pdt/chuong-trinh-dao-tao', app.permission.check('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.put('/api/pdt/chuong-trinh-dao-tao', app.permission.check('dtChuongTrinhDaoTao:write', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/pdt/chuong-trinh-dao-tao', app.permission.check('dtChuongTrinhDaoTao:delete', 'manager:write'), (req, res) => {
    app.model.dtChuongTrinhDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};