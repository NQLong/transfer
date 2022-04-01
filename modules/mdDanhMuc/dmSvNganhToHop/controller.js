module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4091: { title: 'Ngành đào tạo theo tổ hợp môn thi', subTitle: 'Đào tạo', link: '/user/danh-muc/dao-tao/nganh-theo-to-hop-thi' },
    },
  };
  app.permission.add(
    { name: 'dmSvNganhToHop:read', menu },
    { name: 'dmSvNganhToHop:write' },
    { name: 'dmSvNganhToHop:delete' },
  );
  app.get('/user/danh-muc/dao-tao/nganh-theo-to-hop-thi', app.permission.check('dmSvNganhToHop:read'), app.templates.admin);

  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/dao-tao/nganh-theo-to-hop-thi/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    app.model.dmSvNganhToHop.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
      if (error || page == null) {
        res.send({ error });
      } else {
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
      }
    });
  });

  app.get('/api/danh-muc/dao-tao/nganh-theo-to-hop-thi/item/:id', app.permission.check('user:login'), (req, res) => {
    app.model.dmSvNganhToHop.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/dao-tao/nganh-theo-to-hop-thi', app.permission.check('dmSvNganhToHop:write'), (req, res) => {
    app.model.dmSvNganhToHop.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/dao-tao/nganh-theo-to-hop-thi', app.permission.check('dmSvNganhToHop:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvNganhToHop.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/dao-tao/nganh-theo-to-hop-thi', app.permission.check('dmSvNganhToHop:delete'), (req, res) => {
    app.model.dmSvNganhToHop.delete({ id: req.body.id }, errors => res.send({ errors }));
  });
};