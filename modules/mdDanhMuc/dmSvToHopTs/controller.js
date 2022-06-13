module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4092: { title: 'Tổ hợp thi', subTitle: 'Đào tạo', link: '/user/danh-muc/to-hop-thi' },
    },
  };
  const menuDaoTao = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      9012: { title: 'Tổ hợp thi', link: '/user/dao-tao/to-hop-thi' , groupIndex:2 , icon:'fa fa-object-group'},
    },
  };
  app.permission.add(
    { name: 'dmSvToHopTs:read', menu },
    { name: 'dtSvToHopTs:read', menu: menuDaoTao },
    { name: 'dmSvToHopTs:write' },
    { name: 'dmSvToHopTs:delete' },
  );
  app.get('/user/danh-muc/to-hop-thi', app.permission.check('dmSvToHopTs:read'), app.templates.admin);
  app.get('/user/dao-tao/to-hop-thi', app.permission.check('dmSvToHopTs:read'), app.templates.admin);


  // APIs -----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/to-hop-thi/page/:pageNumber/:pageSize', app.permission.orCheck('dmSvToHopTs:read','dmSvToHopTs:read'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    app.model.dmSvToHopTs.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
      if (error || page == null) {
        res.send({ error });
      } else {
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
      }
    });
  });

  app.get('/api/danh-muc/to-hop-thi/item/:id', app.permission.orCheck('dmSvToHopTs:read','dmSvToHopTs:read'), (req, res) => {
    app.model.dmSvToHopTs.get({maToHop: req.params.maToHop }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/to-hop-thi', app.permission.check('dmSvToHopTs:write'), (req, res) => {
    app.model.dmSvToHopTs.create(req.body.data, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/to-hop-thi', app.permission.check('dmSvToHopTs:write'), (req, res) => {
    const changes = req.body.changes || {};
    app.model.dmSvToHopTs.update({ maToHop: req.body.maToHop }, changes, (error, item) => res.send({ error, item }));
  });

  app.delete('/api/danh-muc/to-hop-thi', app.permission.check('dmSvToHopTs:delete'), (req, res) => {
    app.model.dmSvToHopTs.delete({ maToHop: req.body.maToHop }, errors => res.send({ errors }));
  });
};