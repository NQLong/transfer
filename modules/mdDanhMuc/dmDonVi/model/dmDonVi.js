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
    // app.model.dmDonVi.foo = () => { };
    app.model.dmDonVi.getMaDonVi = (ten, done) => {
        if (!ten) {
            done && done(null);
        } else {
            app.model.dmDonVi.getAll((error, itemsDv) => {
                let bestScore = -1, maDv = null;
                for (let idx = 0; idx < itemsDv.length; idx++) {
                    let score = best_choice(ten, itemsDv[idx].ten.toLowerCase());
                    if (score > bestScore) {
                        bestScore = score;
                        maDv = itemsDv[idx].ma;
                    }
                }
                done && done(maDv);
            });
        }
    };
};