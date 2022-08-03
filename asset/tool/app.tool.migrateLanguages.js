let package = require('../../package');
const path = require('path');
// Variables ==================================================================
const app = {
    isDebug: !__dirname.startsWith('/var/www/'),
    fs: require('fs'),
    path,
    publicPath: path.join(__dirname, package.path.public),
    assetPath: path.join(__dirname, ''),
    modulesPath: path.join(__dirname, '../../' + package.path.modules),
    database: {},
    model: {}
};
// Configure ==================================================================
require('../../config/common')(app);
require('../../config/lib/fs')(app);
require('../../config/lib/string')(app);
require('../../config/database.oracleDB')(app, package);

// Init =======================================================================
app.loadModules(false);

const run = async () => {
    try {
        const items = await app.model.fwNews.getAll({}, 'id, isTranslate, language, languages', 'id asc');
        for (const item of items) {
            const changes = {};
            if (item.isTranslate) {
                changes.languages = 'vi,en';
            } else {
                changes.languages = item.language;
            }
            await app.model.fwNews.update({ id: item.id }, changes);
        }
        console.log(' - Migrate done!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

app.readyHooks.add('Run tool.chucVu.js', {
    ready: () => app.database.oracle.connected && app.model && app.model.fwNews,
    run,
});