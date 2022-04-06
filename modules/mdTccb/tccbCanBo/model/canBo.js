// eslint-disable-next-line no-unused-vars

module.exports = app => {
    // app.model.canBo.foo = () => { };
    app.model.canBo.getShccCanBo = (data, done) => {
        const deltaTime = 86400 * 1000; ///1 day
        let { ho, ten, ngaySinh, maDonVi } = data;
        if (ho) {
            ho = ho.toString().trim();
        }
        if (ten) {
            ten = ten.toString().trim();
        }
        if (ngaySinh) { //format: mm/dd/yyyy
            ngaySinh = ngaySinh.toString().trim();
            ngaySinh = new Date(ngaySinh).getTime();
            if (isNaN(ngaySinh)) {
                done('Thông tin ngày sinh bị lỗi !', null);
                return;
            }
        }

        if (maDonVi) {
            maDonVi = maDonVi.toString().trim();
        }
        let condition = {
            statement: 'lower(ho) like lower(:ho) and lower(ten) like lower(:ten)',
            parameter: {
                ho: `%${ho}%`,
                ten: `%${ten}%`,
            }
        };
        app.model.canBo.getAll(condition, (error, items) => {
            if (error || items.length == 0) {
                done('Họ và tên cán bộ không tồn tại !', null);
            } else {
                let bestScore = -1;
                let shcc = null;
                for (let idx = 0; idx < items.length; idx++) {
                    let score = 0;
                    if (items[idx].maDonVi == maDonVi) {
                        score += 0.8;
                    }
                    if (items[idx].ngaySinh) {
                        if (Math.abs(items[idx].ngaySinh - ngaySinh) < deltaTime) {
                            let percent = Math.abs(items[idx].ngaySinh - ngaySinh) / deltaTime;
                            score += 0.2 - percent;
                        }
                    }
                    if (score > bestScore) {
                        bestScore = score;
                        shcc = items[idx].shcc;
                    }
                }
                done(null, shcc);
            }
        });
    };
};