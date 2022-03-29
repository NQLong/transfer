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
};