module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4090: { title: 'Ngành đào tạo', subTitle: 'Đào tạo', link: '/user/danh-muc/dao-tao/nganh-dao-tao' },
    },
  };
  app.permission.add(
    { name: 'dmSvNganhDaoTao:read', menu },
    { name: 'dmSvNganhDaoTao:write' },
    { name: 'dmSvNganhDaoTao:delete' },
  );
  app.get('/user/danh-muc/dao-tao/nganh-dao-tao', app.permission.check('dmSvNganhDaoTao:read'), app.templates.admin);

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/dao-tao/nganh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    app.model.dmSvNganhDaoTao.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
  });

  app.get('/api/danh-muc/dao-tao/nganh-dao-tao/item/:maNganh', app.permission.check('user:login'), (req, res) => {
    app.model.dmSvNganhDaoTao.get({ maNganh: req.params.maNganh }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/dao-tao/nganh-dao-tao', app.permission.check('dmSvNganhDaoTao:write'), (req, res) => {
    let data = req.body.data;
    app.model.dmSvNganhDaoTao.get({ maNganh: data.maNganh }, (error, item) => {
      if (!error && item) {
        res.send({ error: 'Mã đã tồn tại' });
      } else {
        app.model.dmSvNganhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
      }
    });
  });

  app.put('/api/danh-muc/dao-tao/nganh-dao-tao', app.permission.check('dmSvNganhDaoTao:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvNganhDaoTao.update({ maNganh: req.body.maNganh }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/dao-tao/nganh-dao-tao', app.permission.check('dmSvNganhDaoTao:delete'), (req, res) => {
    app.model.dmSvNganhDaoTao.delete({ maNganh: req.body.maNganh }, errors => res.send({ errors }));
  });
};