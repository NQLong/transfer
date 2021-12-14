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
    // app.model.tchcHopDongVienChuc.getAll({}, (error, result) => {
    //     if (result) {
    //         result.forEach(item => {
    //             app.model.canBo.get({shcc: item.nguoiDuocThue}, (er, canBo) => {
    //                 if (canBo) {
    //                     if (canBo.hopDongCanBo != 'LĐ') 
    //                     app.model.canBo.update({shcc: item.nguoiDuocThue}, {hopDongCanBo: 'VC'}, (err, output) => {
    //                         console.log(output);
    //                     });
    //                 }
    //             })
    //         });
    //     }
    // });
    app.model.canBo.getAll({}, (error, result) => {
        if (result) {
            result.forEach(item => {
                if (item.hopDongCanBo != 'LĐ') {
                    app.model.tchcHopDongVienChuc.getAll({ nguoiDuocThue: item.shcc }, (error, output) => {
                        if (output.length > 0) {
                            let max = 0;
                            let i = 0;
                            output.forEach(item => {
                                if (item.ngayKetThucHopDong > max) { max = item.ngayKetThucHopDong; i++; }
                            });
                            if (max != 0) {
                                app.model.canBo.update({ shcc: item.shcc }, { hopDongCanBoNgay: max }, (er, out) => {
                                    console.log(out);
                                });
                            }
                        }
                    });
                }

            });
        }
    });
}

app.readyHooks.add('Run tool.hopDong.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo && app.model.dmDienHopDong && app.model.tchcHopDongVienChuc,
    run,
});