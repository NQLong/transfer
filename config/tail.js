const Tail = require('tail').Tail;
const pm2 = require('pm2');

module.exports = (app) => {
    app.watchFiles = [];
    app.datas = {};

    const clearAppDatas = () => {
        Object.keys(app.datas).forEach(key => {
            app.datas[key] = '';
        });
    };

    app.setupPm2ViewLogs = () => {
        pm2.connect(function (error) {
            if (error) {
                console.error(error);
                process.exit(2);
            }
            pm2.list((error, list) => {
                if (!error) {
                    list.map((process) => {
                        app.setupTailWatch(process.pm2_env.pm_out_log_path);
                        app.setupTailWatch(process.pm2_env.pm_err_log_path);
                    });
                }
            });
        });
    };

    app.intervalEmitEvent = () => {
        setInterval(() => {
            if (app.datas) {
                app.io.to('cluster').emit('tail-log', { datas: app.datas });
                clearAppDatas();
            }
        }, 5000);
    };

    app.setupTailWatch = (path) => {
        try {
            console.log('setupTailWatch', app.watchFiles);
            if (app.watchFiles.includes(path)) return;
            const options = { separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, nLines: 30 };
            const tail = new Tail(path, options);
            app.watchFiles.push(path);
            tail.on('line', (data) => {
                if (!app.datas[path]) app.datas[path] = '';
                app.datas[path] = app.datas[path].concat(`${app.datas[path] ? '\n' : ''}${data}`);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    app.getLogs = (path, nLines, from = 0, cb = () => { }) => {
        app.fs.readFile(path, 'utf-8', (err, data) => {
            if (err) throw err;
            const lines = data.trim().split('\n');
            nLines = nLines > lines.length ? lines.length : nLines;
            app.datas[path] = '';
            for (let index = from; index < nLines; index++) {
                app.datas[path] = app.datas[path].concat(`${app.datas[path] ? '\n' : ''}${lines[lines.length - nLines + parseInt(index)]}`);
            }
            cb();
        });
    };

    // app.setupTailWatch = (path) => {
    //   try {
    //     if (app.primaryWorker) {
    //       console.log('setupTailWatch', app.watchFiles, app.isIntervalEmitEvent)
    //       if (app.watchFiles.includes(path)) return;
    //       let md5Previous = null;
    //       let fsWait = false;
    //       app.watchFiles.push(path);
    //       app.fs.watch(path, (event, filename) => {
    //         if (filename) {
    //           if (fsWait) return;
    //           fsWait = setTimeout(() => {
    //             fsWait = false;
    //           }, 100);
    //           const md5Current = md5(fs.readFileSync(txt_path));
    //           if (md5Current === md5Previous) {
    //             return;
    //           }
    //           md5Previous = md5Current;
    //           console.log(`${filename} file Changed`);
    //         }
    //       })
    //       // !app.isIntervalEmitEvent && app.intervalEmitEvent();
    //     }
    //   } catch (ex) {
    //     console.log(ex);
    //   }
    // }
};
