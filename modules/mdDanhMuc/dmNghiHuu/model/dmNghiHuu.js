// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmNghiHuu.foo = () => { };
    app.model.dmNghiHuu.getTuoiNghiHuu = (data, done) => {
        let { phai, ngaySinh } = data;
        if (ngaySinh instanceof Date && !isNaN(ngaySinh)) {
            let namSinh = ngaySinh.getFullYear();
            let thangSinh = ngaySinh.getMonth();
            thangSinh += 1;
            let soThang = -1;
            app.model.dmNghiHuu.get({ thangSinh, namSinh, phai }, (error, item) => {
                if (item) {
                    soThang = item.soThangNghiHuu;
                } else if (phai == '01') {
                    if (namSinh < 1961) soThang = 720;
                    if (namSinh > 1966 || (namSinh == 1966 && thangSinh >= 4)) soThang = 744;
                } else if (phai == '02') {
                    if (namSinh < 1966) soThang = 660;
                    if (namSinh > 1975 || (namSinh == 1975 && thangSinh >= 5)) soThang = 720;
                }
                if (soThang == -1) {
                    done('Không tìm được tuổi nghỉ hưu', null);
                } else {
                    thangSinh -= 1;
                    soThang += 1;
                    let resultNam = namSinh + Math.trunc(soThang / 12);
                    let resultThang = thangSinh + (soThang % 12);
                    if (resultThang >= 12) {
                        resultThang = resultThang - 12;
                        resultNam += 1;
                    }
                    let resultDate = new Date(Date.UTC(resultNam, resultThang, 1));
                    let prevResultDate = new Date(Date.UTC(resultNam, resultThang, 0));
                    done(null, { resultDate, prevResultDate });
                }
            });
        } else {
            done('Ngày sinh không hợp lệ', null);
        }
    };
};