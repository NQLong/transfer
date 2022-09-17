module.exports = (app) => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      4108: {
        title: 'Cơ sở khám chữa bệnh',
        link: '/user/danh-muc/co-so-kham-chua-benh',
      },
    },
  };

  app.permission.add({ name: 'dmCoSoKcb:read', menu }, 'dmCoSoKcb:write', { name: 'dmCoSoKcb:delete' });

  app.permissionHooks.add('staff','addRoleCoSoKcb', (user, staff) => new Promise((resolve) => {
        if (staff.maDonVi && staff.maDonVi == '32') {
          app.permissionHooks.pushUserPermission(user, 'dmCoSoKcb:write', 'dmCoSoKcb:read', 'dmCoSoKcb:delete');
          resolve();
        } else resolve();
      })
  );

  app.get('/user/danh-muc/co-so-kham-chua-benh', app.permission.check('dmCoSoKcb:read'), app.templates.admin);

  app.get('/api/danh-muc/co-so-kcb-bhyt/get-all-for-adapter', app.permission.check('dmCoSoKcb:read'), async (req, res) => {
    try {
      let searchTerm = req.query.searchTerm;
      let items = await app.model.dmCoSoKcbBhyt.getAll({
        statement: 'loaiDangKy != 0 AND (lower(ma) LIKE :searchTerm OR lower(ten) LIKE :searchTerm OR lower(diaChi) LIKE :searchTerm)',
        parameter: { searchTerm: `%${searchTerm?.toLowerCase() || ''}%` },
      });
      res.send({ items });
    } catch (error) {
      res.send({ error });
    }
  });

  app.get('/api/danh-muc/co-so-kcb-bhyt/item/:ma', app.permission.check(), async (req, res) => {
    try {
      let item = await app.model.dmCoSoKcbBhyt.get({ ma: req.params.ma });
      res.send({ item });
    } catch (error) {
      res.send({ error });
    }
  });
  //api-------------------------------------
  app.get('/api/danh-muc/co-so-kham-chua-benh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
    app.model.dmCoSoKcbBhyt.getPage(pageNumber, pageSize, {}, (error, page) => {
      res.send({ error, page });
    });
  });

  app.get('/api/danh-muc/co-so-kham-chua-benh/all', app.permission.orCheck('dmCoSoKcb:read', 'dmCoSoKcb:read'), (req, res) => {
    app.model.dmCoSoKcbBhyt.getAll((error, items) => res.send({ error, items }));
  });

  app.get('/api/danh-muc/co-so-kham-chua-benh/item/:ma', app.permission.check('user:login'), (req, res) => {
    app.model.dmCoSoKcbBhyt.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/co-so-kham-chua-benh', app.permission.check('dmCoSoKcb:write'), (req, res) => {
    app.model.dmCoSoKcbBhyt.create(req.body.item, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/co-so-kham-chua-benh', app.permission.check('dmCoSoKcb:write'), (req, res) => {
    app.model.dmCoSoKcbBhyt.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
  });

  app.delete('/api/danh-muc/co-so-kham-chua-benh', app.permission.check('dmCoSoKcb:delete'), (req, res) => {
    app.model.dmCoSoKcbBhyt.delete({ ma: req.body.ma }, (error) => res.send({ error }));
  });
};
