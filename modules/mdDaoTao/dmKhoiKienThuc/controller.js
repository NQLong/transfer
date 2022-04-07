module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      9006: {
        title: 'Danh sách Khối kiến thức', icon: 'fa-crosshairs', link: '/user/pdt/khoi-kien-thuc', groupIndex: '2', backgroundColor: '#1B9CC6'
      }
    },
  };
  app.permission.add(
    { name: 'dmKhoiKienThuc:read', menu },
    { name: 'dmKhoiKienThuc:write' },
    { name: 'dmKhoiKienThuc:delete' },
  );

  app.get('/user/pdt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:read'), app.templates.admin);

  //APIs----------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/pdt/khoi-kien-thuc/page/:pageNumber/:pageSize', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
    let pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition == 'string' ? req.query.condition : '';
    app.model.dmKhoiKienThuc.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
      if (error) res.send({ error });
      else {
        let newList = [];
        page.list.forEach((item, index, list) => {
          item.khoiCha ? app.model.dmKhoiKienThuc.get({ ma: item.khoiCha }, (error, khoiCha) => {
            if (!error && khoiCha) newList.push(app.clone(item, { tenKhoiCha: khoiCha.ten }));
            if (index == list.length - 1) res.send({ page: app.clone(page, { list: newList }) });
          }) : newList.push(item);
        });
      }
    });
  });

  app.get('/api/pdt/khoi-kien-thuc/all', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
    app.model.dmKhoiKienThuc.getAll((error, items) => res.send({ error, items }));
  });

  app.get('/api/pdt/khoi-kien-thuc/item/:ma', app.permission.check('dmKhoiKienThuc:read'), (req, res) => {
    app.model.dmKhoiKienThuc.get({ ma: req.params.ma }, (error, item) => {
      res.send({ error, item });
    });
  });

  app.post('/api/pdt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
    app.model.dmKhoiKienThuc.create(req.body.data, (error, item) => res.send({ error, item })));

  app.put('/api/pdt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:write'), (req, res) =>
    app.model.dmKhoiKienThuc.update({ ma: req.body.ma }, req.body.changes || {}, (error, item) => res.send({ error, item })));

  app.delete('/api/pdt/khoi-kien-thuc', app.permission.check('dmKhoiKienThuc:delete'), (req, res) =>
    app.model.dmKhoiKienThuc.delete({ ma: req.body.ma }, error => res.send({ error })));
};