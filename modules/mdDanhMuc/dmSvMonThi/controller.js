module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4089: { title: 'Môn thi', subTitle: 'Đào tạo', link: '/user/danh-muc/mon-thi' },
    },
  };
  const menuDaoTao = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      9011: { title: 'Môn thi', link: '/user/dao-tao/mon-thi', groupIndex: 2, icon: 'fa fa-pencil' },
    },
  };
  app.permission.add(
    { name: 'dmSvMonThi:read', menu },
    { name: 'dtSvMonThi:read', menu: menuDaoTao },
    { name: 'dmSvMonThi:write' },
    { name: 'dmSvMonThi:delete' },
  );
  app.get('/user/danh-muc/mon-thi', app.permission.check('dmSvMonThi:read'), app.templates.admin);
  app.get('/user/dao-tao/mon-thi', app.permission.check('dtSvMonThi:read'), app.templates.admin);

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------

  app.get('/api/danh-muc/mon-thi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    let condition = { statement: null };
    let kichHoat = req.query.kichHoat;

    condition = {
      statement: '(:kichHoat IS NULL OR kichHoat=\'\' OR kichHoat=:kichHoat) AND lower(ten) LIKE :searchText',
      parameter: { searchText: `%${req.query.condition?.toLowerCase() || ''}%`, kichHoat: kichHoat },
    };

    app.model.dmSvMonThi.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
  });


  app.get('/api/danh-muc/mon-thi/item/:id', app.permission.orCheck('dmSvMonThi:read', 'dtSvMonThi:read'), (req, res) => {
    app.model.dmSvMonThi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/mon-thi', app.permission.check('dmSvMonThi:write'), (req, res) => {
    app.model.dmSvMonThi.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/mon-thi', app.permission.check('dmSvMonThi:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvMonThi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/mon-thi', app.permission.check('dmSvMonThi:delete'), (req, res) => {
    app.model.dmSvMonThi.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};