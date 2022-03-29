module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      7001: { title: 'Thời khóa biểu', link: '/user/pdt/thoi-khoa-bieu', icon: 'fa-calendar', backgroundColor: '#1ca474' },
    },
  };
  app.permission.add(
    { name: 'dtThoiKhoaBieu:read', menu },
    { name: 'dtThoiKhoaBieu:write' },
    { name: 'dtThoiKhoaBieu:delete' },
  );

  app.get('/user/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:read'), app.templates.admin);


  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/pdt/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    app.model.dtThoiKhoaBieu.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
  });

  app.get('/api/pdt/thoi-khoa-bieu/all', app.permission.check('user:login'), (req, res) => {
    const condition = req.query.condition || {};
    Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
    app.model.dtThoiKhoaBieu.getAll(condition, '*', 'id ASC ', (error, items) => res.send({ error, items }));
  });

  app.get('/api/pdt/thoi-khoa-bieu/item/:id', app.permission.check('user:login'), (req, res) => {
    app.model.dtThoiKhoaBieu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
    app.model.dtThoiKhoaBieu.create(req.body.item, (error, item) => res.send({ error, item }));
  });

  app.put('/api/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
    app.model.dtThoiKhoaBieu.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:delete'), (req, res) => {
    app.model.dtThoiKhoaBieu.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};