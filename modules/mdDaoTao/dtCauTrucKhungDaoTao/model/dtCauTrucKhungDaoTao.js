// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtCauTrucKhungDaoTao.foo = () => { };
    app.model.dtCauTrucKhungDaoTao.getLastestYear = () => new Promise((resolve, reject) => {
        try {
            app.model.dtCauTrucKhungDaoTao.get({}, 'id,khoa', null, (error, item) => {
                if (error) throw (error);
                else resolve(item);
            });
        } catch (error) {
            reject(error);
        }
    });
};