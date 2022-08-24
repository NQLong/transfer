module.exports = app => {

    app.get('/api/student/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            const user = req.session.user,
                { mssv } = user.data;
            const item = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/student/bhyt', app.permission.check('student:login'), async (req, res) => {
        try {
            const user = req.session.user,
                { mssv, emailTruong } = user.data,
                thoiGian = Date.now();
            const data = req.body.data;

            // temp
            const mapperDienDong = {
                12: 23,
                15: 41
            }, mapperSoTien = {
                15: 704025,
                12: 563220,
                0: 0
            };

            let currentBhyt = await app.model.svBaoHiemYTe.get({ mssv }, '*', 'id DESC');
            if (currentBhyt) {
                if (new Date(currentBhyt.thoiGian).getFullYear() != new Date().getFullYear()) {
                    let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong }));
                    if (!item) res.send({ error: 'Lỗi hệ thống' });
                    else {
                        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                        if (mapperDienDong[data.dienDong]) {
                            app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong], ngayTao: thoiGian });
                            let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                            const { hocPhi, congNo } = currentFee;
                            app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                                hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                                congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                                ngayTao: thoiGian
                            });
                        }
                        res.end();
                    }
                } else res.send({ warning: 'Sinh viên đã đăng ký BHYT cho năm nay!' });
            } else {
                let item = await app.model.svBaoHiemYTe.create(app.clone(data, { mssv, thoiGian, userModified: emailTruong }));
                if (!item) res.send({ error: 'Lỗi hệ thống' });
                else {
                    let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                    app.model.tcHocPhiDetail.create({ namHoc, hocKy, mssv, loaiPhi: mapperDienDong[data.dienDong], soTien: mapperSoTien[data.dienDong] });
                    let currentFee = await app.model.tcHocPhi.get({ namHoc, hocKy, mssv });
                    const { hocPhi, congNo } = currentFee;
                    app.model.tcHocPhi.update({ namHoc, hocKy, mssv }, {
                        hocPhi: parseInt(hocPhi) + mapperSoTien[data.dienDong],
                        congNo: parseInt(congNo) + mapperSoTien[data.dienDong],
                        ngayTao: thoiGian
                    });
                    res.end();
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });
};