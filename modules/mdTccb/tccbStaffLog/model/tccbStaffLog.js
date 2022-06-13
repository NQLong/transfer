// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tccbStaffLog.foo = () => { };
    app.tccbSaveCRUD = (email, crud, quaTrinh = '') => {
        let now = new Date().getTime();
        app.model.tccbStaffLog.get({ email }, (error, tccbStaff) => {
            if (error || !tccbStaff) {
                app.model.tccbStaffLog.create({ email, thaoTac: crud, quaTrinh, ngay: now }, () => { });
            }
            else app.model.tccbStaffLog.update({ email }, { thaoTac: crud, quaTrinh, ngay: now }, () => { });
        });
    };
};