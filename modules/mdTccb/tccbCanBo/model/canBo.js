// eslint-disable-next-line no-unused-vars
// source: https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
function lcs(a, b) {
    let m = a.length, n = b.length, C = [], i, j;
    for (i = 0; i <= m; i++) C.push([0]);
    for (j = 0; j < n; j++) C[0].push(0);
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++)
            C[i+1][j+1] = a[i] === b[j] ? C[i][j]+1 : Math.max(C[i+1][j], C[i][j+1]);
    return C[m][n];
}

function best_choice(s, t) {
    if (!s || !t) return 0;
    let n = s.length, m = t.length, cost = -1;
    if (m < n) {
        cost = lcs(s, t);
    }
    else {
        let i;
        for (i = 0; i < m - n + 1; i++) {
            let sub_t = t.substring(i, i + n);
            cost = Math.max(cost, lcs(s, sub_t));
        }
    }
    return cost;
}
module.exports = app => {
    // app.model.canBo.foo = () => { };
    app.model.canBo.getShccCanBo = (data, done) => {
        const deltaTime = 86400 * 1000; ///1 day
        let ho = data.ho, ten = data.ten, ngaySinh = data.ngaySinh, donVi = data.donVi;
        if (ho) {
            ho = ho.toString().trim();
            ho = ho.toUpperCase();
        }
        if (ten) {
            ten = ten.toString().trim();
            ten = ten.toUpperCase();
        }
        if (ngaySinh) {
            ngaySinh = ngaySinh.toString().trim();
            ngaySinh = new Date(ngaySinh).getTime();
            if (isNaN(ngaySinh)) {
                done('Thông tin ngày sinh bị lỗi !', null);
                return;
            }
        }

        if (donVi) {
            donVi = donVi.toString().trim();
            donVi = donVi.toLowerCase();
        }
        app.model.canBo.getAll({ho: ho, ten: ten}, (error, items) => {
            if (error || items.length == 0) {
                done('Họ và tên cán bộ không tồn tại !', null);
            } else {
                app.model.dmDonVi.getAll((error, items_dv) => {
                    let best_score = -1, ma_dv = null;
                    for (let idx = 0; idx < items_dv.length; idx++) {
                        let score = best_choice(donVi, items_dv[idx].ten.toLowerCase());
                        if (score > best_score) {
                            best_score = score;
                            ma_dv = items_dv[idx].ma;
                        }
                    }
                    best_score = -1;
                    let shcc = null;
                    for (let idx = 0; idx < items.length; idx++) {
                        let score = 0;
                        if (items[idx].maDonVi == ma_dv) {
                            score += 0.8;
                        }
                        if (items[idx].ngaySinh) {
                            if (Math.abs(items[idx].ngaySinh - ngaySinh) < deltaTime) {
                                let percent = Math.abs(items[idx].ngaySinh - ngaySinh) / deltaTime;
                                score += 0.2 - percent;
                            }
                        }
                        if (score > best_score) {
                            best_score = score;
                            shcc = items[idx].shcc;
                        }
                    }
                    done(null, shcc);
                });
            }
        });
    };
};