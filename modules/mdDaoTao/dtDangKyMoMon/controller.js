module.exports = app => {
  const menu = {
    parentMenu: app.parentMenu.daoTao,
    menus: {
      7002: { title: 'Danh sách môn học mở trong học kỳ', link: '/user/pdt/dang-ky-mo-mon', icon: 'fa-paper-plane-o', backgroundColor: '#8E9763' },
    },
  };
  app.permission.add(
    { name: 'dtDangKyMoMon:read', menu },
    { name: 'dtDangKyMoMon:readAll', menu },
    { name: 'manager:read', menu },
    { name: 'dtDangKyMoMon:write' },
    { name: 'dtDangKyMoMon:delete' },
  );

  app.get('/user/pdt/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:readAll', 'manager:read'), app.templates.admin);
  app.get('/user/pdt/dang-ky-mo-mon/:id', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:readAll', 'manager:read'), app.templates.admin);

  //APIs-----------------------------------------------------------------------------------------------------------------------------------------------------
  const checkDaoTaoPermission = (req, res, next) => app.isDebug ? next() : app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:readAll', 'manager:read')(req, res, next);

  app.get('/api/dao-tao/dang-ky-mo-mon/page/:pageNumber/:pageSize', checkDaoTaoPermission, (req, res) => {
    let pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize),
      searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
    const filter = JSON.stringify(req.query.filter || {}),
      donVi = req.query.donVi || 'all';

    app.model.dtDangKyMoMon.searchPage(pageNumber, pageSize, donVi, filter, searchTerm, (error, page) => {
      if (error || page == null) {
        res.send({ error });
      } else {
        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
        const pageCondition = searchTerm;
        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
      }
    });
  });
};