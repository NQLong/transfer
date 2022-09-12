const Tail = require('tail').Tail;
const pm2 = require('pm2');

module.exports = (app) => {
    let watchFiles = [], datas = {};

    const clearAppDatas = () => {
        Object.keys(datas).forEach(key => {
            datas[key] = '';
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
            if (datas) {
                app.io.to('cluster').emit('tail-log', { datas: datas });
                clearAppDatas();
            }
        }, 5000);
    };

    app.setupTailWatch = (path) => {
        try {
            console.log('setupTailWatch', watchFiles);
            if (watchFiles.includes(path)) return;
            const options = { separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, nLines: 50 };
            const tail = new Tail(path, options);
            watchFiles.push(path);
            tail.on('line', (data) => {
                if (!datas[path]) datas[path] = '';
                datas[path] = datas[path].concat(`${datas[path] ? '\n' : ''}${data}`);
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
            // datas[path] = '';
            let rs = '';
            for (let index = 0; index < nLines; index++) {
                rs = rs.concat(`${rs ? '\n' : ''}${lines[lines.length - from - nLines + parseInt(index)]}`);
            }
            cb({ data: rs });
        });
    };

    app.getFreshLog = (cb = () => { }) => {
        const freshData = { ...datas };
        clearAppDatas();
        cb({ data: freshData });
    };

    // app.setupTailWatch = (path) => {
    //   try {
    //     if (app.primaryWorker) {
    //       console.log('setupTailWatch', watchFiles, app.isIntervalEmitEvent)
    //       if (watchFiles.includes(path)) return;
    //       let md5Previous = null;
    //       let fsWait = false;
    //       watchFiles.push(path);
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
