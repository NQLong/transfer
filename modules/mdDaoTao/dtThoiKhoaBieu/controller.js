module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      7001: {
        title: 'Thời khóa biểu', groupIndex: 1,
        link: '/user/pdt/thoi-khoa-bieu', icon: 'fa-calendar', backgroundColor: '#1ca474'
      },
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
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    app.model.dtThoiKhoaBieu.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
      if (error || page == null) {
        res.send({ error });
      } else {
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
      }
    });
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
    let item = req.body.item,
      soNhom = item.nhom;
    const onCreate = (index = 1) => {
      if (index - 1 == Number(soNhom)) {
        res.send({ item: 'OK' });
        return;
      }
      app.model.dtThoiKhoaBieu.get({ maHocPhan: item.maHocPhan, nhom: index, maHocKy: item.maHocKy }, 'id', null, (error, tkb) => {
        if (!error && !tkb) {
          item.nhom = index;
          app.model.dtThoiKhoaBieu.create(item, error => error && res.send({ error }));
        }
        onCreate(index + 1);
      });
    };
    onCreate();
  });

  app.put('/api/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
    app.model.dtThoiKhoaBieu.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/pdt/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:delete'), (req, res) => {
    app.model.dtThoiKhoaBieu.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};