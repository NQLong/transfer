module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4089: { title: 'Môn thi', subTitle: 'Đào tạo', link: '/user/danh-muc/dao-tao/mon-thi' },
    },
  };
  app.permission.add(
    { name: 'dmSvMonThi:read', menu },
    { name: 'dmSvMonThi:write' },
    { name: 'dmSvMonThi:delete' },
  );
  app.get('/user/danh-muc/dao-tao/mon-thi', app.permission.check('dmSvMonThi:read'), app.templates.admin);

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/dao-tao/mon-thi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    let condition = { statement: null };
    if (req.query.condition) {
      condition = {
        statement: 'lower(ten) LIKE :searchText',
        parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
      };
    }
    app.model.dmSvMonThi.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
  });

  app.get('/api/danh-muc/dao-tao/mon-thi/item/:id', app.permission.check('user:login'), (req, res) => {
    app.model.dmSvMonThi.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/dao-tao/mon-thi', app.permission.check('dmSvMonThi:write'), (req, res) => {
    app.model.dmSvMonThi.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/dao-tao/mon-thi', app.permission.check('dmSvMonThi:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvMonThi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/dao-tao/mon-thi', app.permission.check('dmSvMonThi:delete'), (req, res) => {
    app.model.dmSvMonThi.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};