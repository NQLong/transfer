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
    app.model.canBo.getAll({}, (error, result) => {
        let i = 0;
        if (result) {
            result.forEach(item => {
                app.model.qtHopDongLaoDong.getAll({ nguoiDuocThue: item.shcc }, (error, output) => {
                    if (output.length > 0) {
                        let max = 0;
                        let i = 0;
                        output.forEach(item => {
                            if (item.ketThucHopDong > max) { max = item.ketThucHopDong; i++; }
                        });
                        if (max != 0) {
                            app.model.canBo.update({ shcc: item.shcc }, { hopDongCanBo: 'LĐ', hopDongCanBoNgay: max, loaiHopDong: item.loaiHopDong }, (er, out) => {
                                console.log(i++);
                            });
                        }
                    }
                });

            });
        }
    });
}

app.readyHooks.add('Run tool.hopDong.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo && app.model.dmDienHopDong && app.model.qtHopDongLaoDong,
    run,
});