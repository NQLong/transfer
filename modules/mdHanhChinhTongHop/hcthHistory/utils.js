module.exports = {
    createHistory: (app, data) => new Promise((resolve, reject) => {
        app.model.hcthHistory.create({ ...data, thoiGian: new Date().getTime() }, (error, item) => {
            if (error)
                reject(error);
            else
                resolve(item);
        });
    }),
};