// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcHocPhiLog.foo = () => { };
    app.tcHocPhiSaveLog = (email, crud, quaTrinh = '') => {
        let now = new Date().getTime();
        app.model.tcHocPhiLog.create({ email, thaoTac: crud, quaTrinh, ngay: now }, () => { });
    };
};