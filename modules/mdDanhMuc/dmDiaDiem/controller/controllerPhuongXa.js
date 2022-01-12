module.exports = app => {
	const menu = {
		parentMenu: app.parentMenu.category,
		menus: {
			4016: { title: 'Phường xã', link: '/user/danh-muc/phuong-xa' },
		},
	};
	app.permission.add(
		{ name: 'dmPhuongXa:read', menu },
		{ name: 'dmPhuongXa:write' },
		{ name: 'dmPhuongXa:delete' },
		{ name: 'dmPhuongXa:upload' }
	);
	app.get('/user/danh-muc/phuong-xa', app.permission.check('dmPhuongXa:read'), app.templates.admin);
	app.get('/user/danh-muc/phuong-xa/upload', app.permission.check('dmPhuongXa:write'), app.templates.admin);

	// APIs -----------------------------------------------------------------------------------------------------------------------------------------
	app.get('/api/danh-muc/phuong-xa/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
		let pageNumber = parseInt(req.params.pageNumber),
			pageSize = parseInt(req.params.pageSize),
			condition = { statement: null };
		if (req.query.condition) {
			condition = {
				statement: 'lower(tenPhuongXa) LIKE :searchText',
				parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
			};
		}
		app.model.dmPhuongXa.getPage(pageNumber, pageSize, condition, '*', 'maPhuongXa ASC', (error, page) => res.send({ error, page }));
	});

	app.get('/api/danh-muc/phuong-xa/all', app.permission.check('user:login'), (req, res) => {
		app.model.dmPhuongXa.getAll((error, items) => res.send({ error, items }));
	});

	app.get('/api/danh-muc/phuong-xa/all/:maQuanHuyen', (req, res) => {
		const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
		const condition = {
			statement: 'lower(tenPhuongXa) LIKE :searchTerm AND maQuanHuyen LIKE :maQuanHuyen AND kichHoat = 1',
			parameter: { searchTerm: `%${searchTerm.toLowerCase()}%`, maQuanHuyen: req.params.maQuanHuyen },
		};

		app.model.dmPhuongXa.getAll(condition, '*', 'tenPhuongXa', (error, items) => res.send({ error, items }));
	});

	app.get('/api/danh-muc/phuong-xa/item/:maPhuongXa', app.permission.check('user:login'), (req, res) => {
		app.model.dmPhuongXa.get({maPhuongXa: req.params.maPhuongXa}, (error, item) => res.send({ error, item }));
	});

	app.post('/api/danh-muc/phuong-xa', app.permission.check('dmPhuongXa:write'), (req, res) => {
		app.model.dmPhuongXa.create(req.body.item, (error, item) => res.send({ error, item }));
	});

	app.put('/api/danh-muc/phuong-xa', app.permission.check('dmPhuongXa:write'), (req, res) => {
		let changes = app.clone(req.body.changes);
		app.model.dmPhuongXa.update({ maPhuongXa: req.body.maPhuongXa }, changes, (error, items) => res.send({ error, items }));
	});

	app.delete('/api/danh-muc/phuong-xa', app.permission.check('dmPhuongXa:delete'), (req, res) => {
		app.model.dmPhuongXa.delete({ maPhuongXa: req.body.maPhuongXa }, (error) => res.send({ error }));
	});

	app.post('/api/danh-muc/phuong-xa/createFromFile', app.permission.check('dmPhuongXa:write'), (req, res) => {
		let dataUpload = req.body.item;
		const options = {
			autoCommit: true,
			batchErrors: true
		};
		const sql = 'INSERT INTO DM_PHUONG_XA (MA_PHUONG_XA, MA_QUAN_HUYEN, TEN_PHUONG_XA, KICH_HOAT) VALUES (:maPhuongXa, :maQuanHuyen, :tenPhuongXa, :kichHoat)';
		app.dbConnection.executeMany(sql, dataUpload, options, (err, result) => {
			res.send(result);
		});
	});

	app.post('/api/danh-muc/phuong-xa/upload', app.permission.check('dmPhuongXa:upload'), (req, res) => {
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
	const phuongXaImportData = (req, fields, files, params, done) => {
		if (fields.userData && fields.userData[0] && fields.userData[0] == 'phuongXaImportData' && files.PhuongXaFile && files.PhuongXaFile.length > 0) {
			const srcPath = files.PhuongXaFile[0].path;
			const workbook = app.excel.create();
			workbook.xlsx.readFile(srcPath).then(() => {
				const worksheet = workbook.getWorksheet(1);
				let index = 1, phuongXa = [];
				while (true) {
					index++;
					let maPhuongXa = worksheet.getCell('A' + index).value;
					if (maPhuongXa) {
						maPhuongXa = maPhuongXa.toString().trim();
						const maQuanHuyen = worksheet.getCell('B' + index).value ? worksheet.getCell('B' + index).value.toString().trim() : '';
						const tenPhuongXa = worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.toString().trim() : '';
						const kichHoat = worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.toString().trim() : 1;
						phuongXa.push({ maPhuongXa, maQuanHuyen, tenPhuongXa, kichHoat });
					} else {
						require('fs').unlinkSync(srcPath);
						req.session.phuongXa = phuongXa;
						done({
							number: phuongXa.length,
							phuongXa
						});
						break;
					}
				}
			});
		}
	};

	app.uploadHooks.add('phuongXaImportData', (req, fields, files, params, done) =>
		app.permission.has(req, () => phuongXaImportData(req, fields, files, params, done), done, 'dmPhuongXa:write'));
};