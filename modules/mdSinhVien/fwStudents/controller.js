module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1016: { title: 'Thông tin cá nhân sinh viên', link: '/user/sinh-vien/info', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'student:login', menu },
    );
    app.get('/user/sinh-vien/info', app.permission.check('student:login'), app.templates.admin);

    //API
    app.get('/api/user/sinh-vien/edit/item', app.permission.check('student:login'), (req, res) => {
        let studentId = req.session.user.studentId ? req.session.user.studentId.trim() : '';
        app.model.fwStudents.get({ mssv: studentId }, (error, sinhVien) => {
            if (error || !sinhVien) {
                res.send({ error: 'Không tìm thấy thông tin sinh viên!' });
            } else {
                res.send({ item: Object.assign(sinhVien,{ image: req.session.user.image}) });
            }
        });
    });

    app.put('/api/user/student', app.permission.check('student:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            const changes = req.body.changes;
            app.model.fwStudents.get({mssv: req.session.user.studentId}, (error, sinhVien) => {
                if (!sinhVien) {
                    changes.mssv = req.session.user.studentId;
                    app.model.fwStudents.create(changes, (error, item) => {
                        res.send({error, item});
                    });
                } else {    
                    app.model.fwStudents.update({mssv: req.session.user.studentId}, changes, (error, item) => {
                        res.send({error, item});
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

      // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
      app.createFolder(app.path.join(app.publicPath, '/img/sinhVien/avatar'));

      const uploadSinhImage = (req, fields, files, params, done) => {
          if (fields.userData && fields.userData.length && fields.userData[0].startsWith('SinhVienImage:') && files.SinhVienImage && files.SinhVienImage.length) {
              console.log('Hook: uploadCanBoImage');
              app.model.fwUser.get({ studentId: fields.userData[0].substring('SinhVienImage:'.length) }, (error, item) => {
                  if (error || item == null) {
                      done({ error: 'Không tồn tại người dùng này!' });
                  } else {
                      app.deleteImage(item.image);
                      let srcPath = files.SinhVienImage[0].path,
                          image = '/img/sinhVien/avatar/' + item.studentId + app.path.extname(srcPath);
                      app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => {
                          if (error) {
                              done({ error });
                          } else {
                              image += '?t=' + (new Date().getTime()).toString().slice(-8);
                              app.model.fwUser.update({ studentId: item.studentId }, { image }, (error, item) => {
                                  if (error == null) {
                                      app.io.emit('avatar-changed', item);
                                      req.session.user.image = image;
                                  }
                                  done({ error, item, image });
                              });
                          }
                      });
                  }
              });
          }
      };
      app.uploadHooks.add('uploadSinhImage', (req, fields, files, params, done) =>
          app.permission.has(req, () => uploadSinhImage(req, fields, files, params, done), done, 'student:login'));
};
