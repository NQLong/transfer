module.exports = app => {
    app.createFolder = function () {
        for (let i = 0; i < arguments.length; i++) {
            !app.fs.existsSync(arguments[i]) && app.fs.mkdirSync(arguments[i]);
        }
    };

    app.deleteFolder = path => {
        if (app.fs.existsSync(path)) {
            app.fs.readdirSync(path).forEach(file => {
                const curPath = path + '/' + file;
                app.fs.lstatSync(curPath).isDirectory() ? app.deleteFolder(curPath) : app.fs.unlinkSync(curPath);
            });
            app.fs.rmdirSync(path);
        }
    };

    app.deleteFile = path => app.fs.existsSync(path) && app.fs.unlinkSync(path);
};