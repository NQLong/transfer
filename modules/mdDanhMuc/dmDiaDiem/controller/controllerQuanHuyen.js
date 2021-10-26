module.exports = app => {
	const menu = {
		parentMenu: app.parentMenu.category,
		menus: {
			2115: { title: 'Quận huyện', link: '/user/danh-muc/quan-huyen' },
		},
	};
	app.permission.add(
		{ name: 'dmQuanHuyen:read', menu },
		{ name: 'dmQuanHuyen:write' },
		{ name: 'dmQuanHuyen:delete' },
		{ name: 'dmQuanHuyen:upload' }
	);
	app.get('/user/danh-muc/quan-huyen', app.permission.check('dmQuanHuyen:read'), app.templates.admin);
	app.get('/user/danh-muc/quan-huyen/upload', app.permission.check('dmQuanHuyen:write'), app.templates.admin);

	// APIs -----------------------------------------------------------------------------------------------------------------------------------------
	app.get('/api/danh-muc/quan-huyen/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
		let pageNumber = parseInt(req.params.pageNumber),
			pageSize = parseInt(req.params.pageSize),
			condition = { statement: null };
		if (req.query.condition) {
			condition = {
				statement: 'lower(tenQuanHuyen) LIKE :searchText',
				parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
			};
		}
		app.model.dmQuanHuyen.getPage(pageNumber, pageSize, condition, '*', 'maTinhThanhPho ASC, tenQuanHuyen ASC', (error, page) => res.send({ error, page }));
	});

	app.get('/api/danh-muc/quan-huyen/all/:maTinhThanhPho', (req, res) => {
		const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
		const condition = {
			statement: 'lower(tenQuanHuyen) LIKE :searchTerm AND maTinhThanhPho LIKE :maTinhThanhPho AND kichHoat = 1',
			parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, maTinhThanhPho: req.params.maTinhThanhPho },
		};
		app.model.dmQuanHuyen.getAll(condition, '*', 'tenQuanHuyen', (error, items) => res.send({ error, items }));
	});

	app.get('/api/danh-muc/quan-huyen/all', app.permission.check('user:login'), (req, res) => {
		app.model.dmQuanHuyen.getAll((error, items) => res.send({ error, items }));
	});

	app.get('/api/danh-muc/quan-huyen/item/:maQuanHuyen', app.permission.check('user:login'), (req, res) => {
		app.model.dmQuanHuyen.get({maQuanHuyen: req.params.maQuanHuyen}, (error, item) => res.send({ error, item }));
	});

	app.post('/api/danh-muc/quan-huyen', app.permission.check('dmQuanHuyen:write'), (req, res) => {
		app.model.dmQuanHuyen.create(req.body.item, (error, item) => res.send({ error, item }));
	});

	app.put('/api/danh-muc/quan-huyen', app.permission.check('dmQuanHuyen:write'), (req, res) => {
		app.model.dmQuanHuyen.update({ maQuanHuyen: req.body.maQuanHuyen }, req.body.changes, (error, items) => res.send({ error, items }));
	});

	app.delete('/api/danh-muc/quan-huyen', app.permission.check('dmQuanHuyen:delete'), (req, res) => {
		app.model.dmQuanHuyen.delete({ maQuanHuyen: req.body.maQuanHuyen }, (error) => res.send({ error }));
	});

	app.post('/api/danh-muc/quan-huyen/createFromFile', app.permission.check('dmQuanHuyen:write'), (req, res) => {
		let dataUpload = req.body.item;
		const options = {
			autoCommit: true,
			batchErrors: true
		};
		const sql = 'INSERT INTO DM_QUAN_HUYEN (MA_QUAN_HUYEN, MA_TINH_THANH_PHO, TEN_QUAN_HUYEN, KICH_HOAT) VALUES (:maQuanHuyen, :maTinhThanhPho, :tenQuanHuyen, :kichHoat)';
		app.dbConnection.executeMany(sql, dataUpload, options, (err, result) => {
			res.send(result);
		});
	});

	app.post('/api/danh-muc/quan-huyen/upload', app.permission.check('dmQuanHuyen:upload'), (req, res) => {
		app.getUploadForm().parse(req, (error, fields, files) => {
			if (error) {
				res.send({ error });
			} else {
				let hasResponsed = false;
				app.uploadHooks.run(req, fields, files, req.query, data => {
					if (hasResponsed == false) res.send(data);
					hasResponsed = true;
				});
			}
		});
	});

	// Hook uploadHooks -----------------------------------------------------------------------------------------------------------------------------
	const quanHuyenImportData = (req, fields, files, params, done) => {
		if (fields.userData && fields.userData[0] && fields.userData[0] == 'quanHuyenImportData' && files.QuanHuyenFile && files.QuanHuyenFile.length > 0) {
			const srcPath = files.QuanHuyenFile[0].path;
			const workbook = app.excel.create();
			workbook.xlsx.readFile(srcPath).then(() => {
				const worksheet = workbook.getWorksheet(1);
				let index = 1, quanHuyen = [];

				while (true) {
					index++;
					let maQuanHuyen = worksheet.getCell('A' + index).value;
					if (maQuanHuyen) {
						maQuanHuyen = maQuanHuyen.toString().trim();
						const maTinhThanhPho = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '';
						const tenQuanHuyen = worksheet.getCell('C' + index).value ? worksheet.getCell('C' + index).value.toString().trim() : '';
						const kichHoat = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : 1;
						quanHuyen.push({ maQuanHuyen, maTinhThanhPho, tenQuanHuyen, kichHoat });
					} else {
						require('fs').unlinkSync(srcPath);
						req.session.quanHuyen = quanHuyen;
						done({
							number: quanHuyen.length,
							quanHuyen
						});
						break;
					}
				}
			});
		}
	};

	app.uploadHooks.add('quanHuyenImportData', (req, fields, files, params, done) =>
		app.permission.has(req, () => quanHuyenImportData(req, fields, files, params, done), done, 'dmQuanHuyen:write'));
};