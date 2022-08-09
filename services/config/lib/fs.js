module.exports = app => {
    app.fs.createFolder = function () {
        for (let i = 0; i < arguments.length; i++) {
            !app.fs.existsSync(arguments[i]) && app.fs.mkdirSync(arguments[i]);
        }
    };

    app.fs.deleteFolder = path => {
        if (app.fs.existsSync(path)) {
            app.fs.readdirSync(path).forEach(file => {
                const curPath = path + '/' + file;
                app.fs.lstatSync(curPath).isDirectory() ? app.fs.deleteFolder(curPath) : app.fs.unlinkSync(curPath);
            });
            app.fs.rmdirSync(path);
        }
    };

    app.fs.deleteFile = path => app.fs.existsSync(path) && app.fs.unlinkSync(path);
};