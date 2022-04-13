// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthHistory.foo = () => { };
    app.model.hcthHistory.createHistory = (data) => new Promise((resolve, reject) => { 
        app.model.hcthHistory.create({ ...data, thoiGian: new Date().getTime() }, (error, item) => {
            if (error)
                reject(error);
            else
                resolve(item);
        });
    });
};