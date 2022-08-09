module.exports = app => {
    app.model.fwStorage.delete2 = (condition, done) => {
        app.model.fwStorage.get(condition, (error, storage) => {
            app.fs.deleteFile(app.path.join(app.documentPath, storage.path));
            app.model.fwStorage.delete(condition, done);
        });
    };
};