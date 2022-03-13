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
require('../../config/io')(app);
require('../../config/lib/excel')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database')(app, package);

// Init =======================================================================
app.loadModules(false);
const run = () => {
    app.model.canBo.getShccCanBo('Nguyễn Thị Hoàng', 'Yến', '12/12/1964', 'Khoa Việt Nam học', (error, shcc) => {
        console.log("data1 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('Ngô Thị Phương', 'Lan', '12/11/1964', 'Ban giám hiệu', (error, shcc) => {
        console.log("data2 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('Ngô Thị Phương', 'Lan', null, 'Ban giám hiệu', (error, shcc) => {
        console.log("data3 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('Ngô Thị Phương', 'Lan', '12/11/1964', null, (error, shcc) => {
        console.log("data4 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('Ngô Thị Phương', 'Lan', null, null, (error, shcc) => {
        console.log("data5 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('Ngô Thị Phương', 'Lan', '22/11/1970', null, (error, shcc) => { //failed ngày sinh
        console.log("data6 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('NGUYỄN THỊ THU', 'HIỀN', null, 'Địa lý', (error, shcc) => {
        console.log("data7 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('NGUYỄN THỊ THU', 'HIỀN', null, 'Công tác xã hội', (error, shcc) => {
        console.log("data8 = ", {error, shcc});
    });
    app.model.canBo.getShccCanBo('NGUYỄN THỊ THU', 'HIỀN', null, 'Tổ chức cán bộ', (error, shcc) => {
        console.log("data9 = ", {error, shcc});
    });
};

app.readyHooks.add('Run tool.testGetShccCanBo.js', {
    ready: () => app.dbConnection && app.model && app.model.canBo,
    run,
});