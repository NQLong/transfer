module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4096: { title: 'Hạng thương binh', subTitle: 'Cán bộ', link: '/user/danh-muc/hang-thuong-binh' },
    },
  };

  app.permission.add(
    { name: 'dmHangThuongBinh:read', menu },
    { name: 'dmHangThuongBinh:write' },
    { name: 'dmHangThuongBinh:delete' },

  );
  app.get('/user/danh-muc/hang-thuong-binh', app.permission.check('dmHangThuongBinh:read'), app.templates.admin);

  //API ------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/hang-thuong-binh/page/:pageNumber/:pageSize', async (req, res) => {
    try {
      let pageNumber = parseInt(req.params.pageNumber),
        pageSize = parseInt(req.params.pageSize),
        condition = { statement: null };
      if (req.query.condition) {
        condition = {
          statement: 'lower(moTa) LIKE :searchText OR lower(ten) LIKE :searchText',
          parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
        };
      }
      app.model.dmHangThuongBinh.getPage(pageNumber, pageSize, condition, (error, page) => {
        if (error) throw (error);
        else res.send({ page });
      });
    } catch (error) {
      res.send(error);
    }

  });

  app.get('/api/danh-muc/hang-thuong-binh/all', app.permission.check('user:login'), (req, res) => {
    let searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
      condition = {
        statement: 'lower(ten) like :searchTerm OR lower(moTa) like :searchTerm',
        parameter: { searchTerm }
      };
    app.model.dmHangThuongBinh.getAll(condition, (error, items) => res.send({ error, items }));
  });

  app.get('/api/danh-muc/hang-thuong-binh/item/:ma', app.permission.check('user:login'), (req, res) => {
    app.model.dmHangThuongBinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/hang-thuong-binh', app.permission.check('dmHangThuongBinh:write'), (req, res) => {
    app.model.dmHangThuongBinh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/danh-muc/hang-thuong-binh', app.permission.check('dmHangThuongBinh:delete'), (req, res) => {
    app.model.dmHangThuongBinh.delete({ ma: req.body.ma }, error => res.send({ error }));
  });
};