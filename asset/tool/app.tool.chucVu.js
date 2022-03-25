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
require('../../config/database.oracleDB')(app, package.db);

// Init =======================================================================
app.loadModules(false);

const run = () => {
    app.model.qtChucVu.getAll({}, (error, result) => {
        if (result) {
            result.forEach(item => {
                if (item.chucVuChinh) {
                    app.model.canBo.get({ shcc: item.shcc }, (error, canBo) => {
                        if (canBo) {
                            app.model.canBo.update({ shcc: item.shcc }, { maChucVu: item.maChucVu, maDonVi: item.maDonVi }, (error, output) => {
                                console.log(output);
                            });
                        }
                    });
                }
            });
        }
    });
}

app.readyHooks.add('Run tool.chucVu.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.canBo && app.model.dmChucVu && app.model.qtChucVu,
    run,
});