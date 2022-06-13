// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcHocPhiLog.foo = () => { };
    app.tcHocPhiSaveLog = (email, crud, item) => {
        const { mssv, hocKy, namHoc, duLieuCu, duLieuMoi} = item;
        let now = new Date().getTime();
        app.model.tcHocPhiLog.create({ email, thaoTac: crud, mssv, hocKy, namHoc, duLieuCu, duLieuMoi, ngay: now }, () => { });
    };
};