module.exports = (app) => {
  const menu = {
    parentMenu: app.parentMenu.category,
    menus: {
      2998: { title: 'Đơn vị tính', link: '/user/danh-muc/don-vi-tinh' },
    },
  };
  app.permission.add(
    { name: 'dmDonViTinh:read', menu },
    { name: 'dmDonViTinh:write' },
    { name: 'dmDonViTinh:delete' },
    { name: 'dmDonViTinh:upload' },
  );
  app.get('/user/danh-muc/don-vi-tinh', app.permission.check('dmDonViTinh:read'), app.templates.admin);
  app.get('/user/danh-muc/don-vi-tinh/upload', app.permission.check('dmDonViTinh:upload'), app.templates.admin);

  // APIs ----------------------------------------------------------------------------------------------------------------------------------------
  app.get('/api/danh-muc/don-vi-tinh/page/:pageNumber/:pageSize', app.permission.check('dmDonViTinh:read'), (req, res) => {
    const pageNumber = parseInt(req.params.pageNumber),
      pageSize = parseInt(req.params.pageSize);
    let condition = { statement: null };
    const statement = ['ma', 'ten'].map((i) => `lower(${i}) LIKE :searchText`).join(' OR ');
    if (req.query.condition) {
      condition = {
        statement,
        parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
      };
    }
    app.model.dmDonViTinh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
  });

  app.get('/api/danh-muc/don-vi-tinh/all', app.permission.check('dmDonViTinh:read'), (req, res) => {
    app.model.dmDonViTinh.getAll((error, items) => res.send({ error, items }));
  });

  app.get('/api/danh-muc/don-vi-tinh/item/:ma', app.permission.check('dmDonViTinh:read'), (req, res) => {
    app.model.dmDonViTinh.get(req.params.ma, (error, item) => res.send({ error, item }));
  });

  app.post('/api/danh-muc/don-vi-tinh', app.permission.check('dmDonViTinh:write'), (req, res) => {
    app.model.dmDonViTinh.create(req.body.item, (error, item) => res.send({ error, item }));
  });

  app.put('/api/danh-muc/don-vi-tinh', app.permission.check('dmDonViTinh:write'), (req, res) => {
    let changes = app.clone(req.body.changes);
    app.model.dmDonViTinh.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
  });

  app.post('/api/danh-muc/don-vi-tinh/createFromFile', app.permission.check('dmDonViTinh:write'), (req, res) => {
    let dataUpload = req.body.item;
    const errorList = [];
    for (let i = 0; i <= dataUpload.length; i++) {
      if (i == dataUpload.length) {
        res.send({ error: errorList });
      } else {
        const currentItem = dataUpload[i];
        app.model.dmDonViTinh.create(currentItem, (error) => {
          if (error) errorList.push(error);
        });
      }
    }
  });

  app.post('/api/danh-muc/don-vi-tinh/upload', app.permission.check('dmDonViTinh:upload'), (req, res) => {
    app.getUploadForm().parse(req, (error, fields, files) => {
      if (error) {
        res.send({ error });
      } else {
        let hasResponsed = false;
        app.uploadHooks.run(req, fields, files, req.query, (data) => {
          if (hasResponsed == false) res.send(data);
          hasResponsed = true;
        });
      }
    });
  });

  app.delete('/api/danh-muc/don-vi-tinh', app.permission.check('dmDonViTinh:delete'), (req, res) => {
    app.model.dmDonViTinh.delete({ ma: req.body.ma }, (error) => res.send({ error }));
  });

  //Hook uploadHooks ------------------------------------------------------------------------------------------------------------------------------
  const dmDonViTinhImportData = (req, fields, files, params, done) => {
    if (fields.userData && fields.userData[0] && fields.userData[0] == 'dmDonViTinhImportData' && files.DmDonViTinhFile && files.DmDonViTinhFile.length > 0) {
      app.importDmDonViTinhData(req, files.DmDonViTinhFile[0].path, done);
    }
  };

  app.uploadHooks.add('dmQuocGiaImportData', (req, fields, files, params, done) =>
    app.permission.has(req, () => dmDonViTinhImportData(req, fields, files, params, done), done, 'dmDonViTiNH:write')
  );

  app.importDmDonViTinhData = (req, srcPath, sendResponse) => {
    const workbook = app.excel.create();
    workbook.xlsx.readFile(srcPath).then(() => {
      const worksheet = workbook.getWorksheet(1);
      let index = 1,
        dmDonViTinh = [];
      while (true) {
        index++;
        let ma = worksheet.getCell('A' + index).value;
        if (ma) {
          ma = ma.toString().trim();
          const ten = worksheet.getCell('B' + index).value.toString().trim();
          dmDonViTinh.push({ ma, ten });
        } else {
          app.fs.unlinkSync(srcPath);
          req.session.dmDonViTinh = dmDonViTinh;
          sendResponse({ dmDonViTinh });
          break;
        }
      }
    });
  };
};