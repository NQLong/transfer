module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4088: { title: 'Đối tượng tuyển sinh', subTitle: 'Đào tạo', link: '/user/danh-muc/doi-tuong-tuyen-sinh' },
      
    },
  };
  const menuDaoTao = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      9013: { title: 'Đối tượng tuyển sinh', link: '/user/dao-tao/doi-tuong-tuyen-sinh', groupIndex: 2, icon: 'fa fa-user-circle-o' },
    },
  };

  app.permission.add(
    { name: 'dmSvDoiTuongTs:read', menu },
    { name: 'dmSvDoiTuongTs:read', menu: menuDaoTao },
    { name: 'dmSvDoiTuongTs:write' },
    { name: 'dmSvDoiTuongTs:delete' },
  );
  app.get('/user/dao-tao/doi-tuong-tuyen-sinh', app.permission.check('dmSvDoiTuongTs:read'), app.templates.admin);
  app.get('/user/danh-muc/doi-tuong-tuyen-sinh', app.permission.check('dmSvDoiTuongTs:read'), app.templates.admin);
  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/doi-tuong-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    let condition = { statement: null };
    if (req.query.condition) {
      condition = {
        statement: 'lower(ten) LIKE :searchText OR lower(ma) LIKE :searchText',
        parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
      };
    }
    app.model.dmSvDoiTuongTs.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
  });

  app.get('/api/danh-muc/doi-tuong-tuyen-sinh/item/:ma', app.permission.check('user:login'), (req, res) => {
    app.model.dmSvDoiTuongTs.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/doi-tuong-tuyen-sinh', app.permission.check('dmSvDoiTuongTs:write'), (req, res) => {
    let data = req.body.data;
    app.model.dmSvDoiTuongTs.get({ ma: data.ma }, (error, item) => {
      if (!error && item) {
        res.send({ error: 'Mã đã tồn tại' });
      } else {
        app.model.dmSvDoiTuongTs.create(req.body.data, (error, item) => res.send({ error, item }));
      }
    });
  });

  app.put('/api/danh-muc/doi-tuong-tuyen-sinh', app.permission.check('dmSvDoiTuongTs:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvDoiTuongTs.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/doi-tuong-tuyen-sinh', app.permission.check('dmSvDoiTuongTs:delete'), (req, res) => {
    app.model.dmSvDoiTuongTs.delete({ ma: req.body.ma }, errors => res.send({ errors }));
  });
};