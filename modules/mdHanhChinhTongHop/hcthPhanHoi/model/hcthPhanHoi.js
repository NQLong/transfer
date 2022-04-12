// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthPhanHoi.foo = () => { };
    app.model.hcthPhanHoi.getPhanHoi = (target, type) => new Promise((resolve, reject) => {
        app.model.hcthPhanHoi.getAllFrom(target, type, (error, items) => {
            if (error) {
                reject(error);
            } else {
                resolve({ items: items.rows || [] });
            }
        });
    });
};