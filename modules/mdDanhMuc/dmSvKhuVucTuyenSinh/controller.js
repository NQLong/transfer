module.exports = app => {
	const menu = {
		parentMenu: app.parentMenu.category,
		menus: {
			4094: { title: 'Khu vực tuyển sinh', link: '/user/danh-muc/khu-vuc-tuyen-sinh' },
	
		},
	};
	const menuDaoTao = {
		parentMenu: app.parentMenu.daoTao,
		menus: {
			9014: { title: 'Khu vực tuyển sinh', link: '/user/dao-tao/khu-vuc-tuyen-sinh', groupIndex: 2, icon: 'fa fa-binoculars' },
		},
	};
  
	app.permission.add(
		{ name: 'dmSvKhuVucTuyenSinh:read', menu },
		{ name: 'dmSvKhuVucTuyenSinh:read', menu: menuDaoTao },
		{ name: 'dmSvKhuVucTuyenSinh:write' },
		{ name: 'dmSvKhuVucTuyenSinh:delete' },
	);
	app.get('/user/dao-tao/khu-vuc-tuyen-sinh', app.permission.check('dmSvKhuVucTuyenSinh:read'), app.templates.admin);
	app.get('/user/danh-muc/khu-vuc-tuyen-sinh', app.permission.check('dmSvKhuVucTuyenSinh:read'), app.templates.admin);
	// APIs -----------------------------------------------------------------------------------------------------------------------------------------
	app.get('/api/danh-muc/khu-vuc-tuyen-sinh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
		const pageNumber = parseInt(req.params.pageNumber),
			pageSize = parseInt(req.params.pageSize);
		let condition = { statement: null };
		if (req.query.condition) {
			condition = {
				statement: 'lower(ten) LIKE :searchText OR lower(ma) LIKE :searchText',
				parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
			};
		}
		app.model.dmSvKhuVucTuyenSinh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
	});
  
	app.get('/api/danh-muc/khu-vuc-tuyen-sinh/item/:ma', app.permission.check('user:login'), (req, res) => {
		app.model.dmSvKhuVucTuyenSinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
	});
  
	app.post('/api/danh-muc/khu-vuc-tuyen-sinh', app.permission.check('dmSvKhuVucTuyenSinh:write'), (req, res) => {
		let data = req.body.data;
		app.model.dmSvKhuVucTuyenSinh.get({ ma: data.ma }, (error, item) => {
			if (!error && item) {
				res.send({ error: 'Mã đã tồn tại' });
			} else {
				app.model.dmSvKhuVucTuyenSinh.create(req.body.data, (error, item) => res.send({ error, item }));
			}
		});
	});
  
	app.put('/api/danh-muc/khu-vuc-tuyen-sinh', app.permission.check('dmSvKhuVucTuyenSinh:write'), (req, res) => {
		const changes = req.body.changes || {};
		app.model.dmSvKhuVucTuyenSinh.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
	});
  
	app.delete('/api/danh-muc/khu-vuc-tuyen-sinh', app.permission.check('dmSvKhuVucTuyenSinh:delete'), (req, res) => {
		app.model.dmSvKhuVucTuyenSinh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
	});
};