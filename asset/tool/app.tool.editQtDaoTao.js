let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    mongodb: 'mongodb://localhost:27017/' + package.db.name,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package.db);

// Init =======================================================================
app.loadModules(false);

const run = () => {
    let i = 0;
    app.model.qtDaoTao.getAll({}, (error, qtDt) => {
        if (qtDt) {
            qtDt.forEach(item => {
                app.model.dmHinhThucDaoTao.get({ma: item.hinhThuc}, (e, s) => {
                    if (s) {
                        app.model.qtDaoTao.update({id: item.id}, {hinhThuc: s.ten}, (er, suc) => {
                            if (suc) console.log(i++);
                        })
                    }
                });
            });
            // qtDt.forEach(item => {
            //     app.model.dmLoaiBangCap.get({ma: item.loaiBangCap}, (e, s) => {
            //         if (s) {
            //             app.model.qtDaoTao.update({id: item.id}, {loaiBangCap: s.ten}, (er, suc) => {
            //                 if (suc) console.log(i++);
            //             })
            //         }
            //     });
            // });
        }
    });
}

app.readyHooks.add('Run tool.editQtDaoTao.js', {
    ready: () => app.dbConnection && app.model && app.model.dmHinhThucDaoTao && app.model.qtDaoTao && app.model.dmLoaiBangCap,
    run,
});