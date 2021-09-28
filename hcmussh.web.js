let packageConfig = require('./package'),
    isDebug = !__dirname.startsWith('/var/www/');
const express = require('express');
const app = express();
app.fs = require('fs');
app.path = require('path');
app.isDebug = isDebug;

const server = app.isDebug ?
    require('http').createServer(app) :
    require('https').createServer({
        cert: app.fs.readFileSync('/etc/ssl/hcmussh_certificate.crt'),
        ca: app.fs.readFileSync('/etc/ssl/hcmussh_ca_bundle.crt'),
        key: app.fs.readFileSync('/etc/ssl/hcmussh_private.key'),
    }, app);

// Variables ==================================================================
app.port = packageConfig.port;
app.rootUrl = packageConfig.rootUrl;
app.debugUrl = 'http://localhost:' + app.port;
app.mongodb = 'mongodb://localhost:27017/' + packageConfig.dbName;
app.apiKeySendGrid = packageConfig.email.apiKeySendGrid;
app.defaultAdminEmail = packageConfig.default.adminEmail;
if (!app.isDebug && app.fs.existsSync('./asset/config.json')) packageConfig = Object.assign({}, packageConfig, require('./asset/config.json'));

app.mailSentName = packageConfig.email.from;
app.assetPath = app.path.join(__dirname, 'asset');
app.modulesPath = app.path.join(__dirname, packageConfig.path.modules);
app.viewPath = app.path.join(__dirname, packageConfig.path.view);
app.publicPath = app.path.join(__dirname, packageConfig.path.public);
app.imagePath = app.path.join(packageConfig.path.public, 'img');
app.uploadPath = app.path.join(__dirname, packageConfig.path.upload);
app.documentPath = app.path.join(__dirname, packageConfig.path.document);
app.faviconPath = app.path.join(__dirname, packageConfig.path.favicon);

// Configure ==================================================================
require('./config/common')(app);
require('./config/view')(app, express);
require('./config/packages')(app, server, packageConfig);
require('./config/database')(app, packageConfig.db);
require('./config/authentication')(app);
require('./config/permission')(app);
require('./config/authentication.google')(app);
require('./config/io')(app, server);

// Init =======================================================================
app.createTemplate('home', 'admin', 'unit');
app.loadModules();
app.get('/user', app.permission.check(), app.templates.admin);
app.get('/download/:name', (req, res) => {
    const fileName = req.params.name, path = app.path.join(app.documentPath, fileName);
    if (app.fs.existsSync(path)) {
        res.download(path, fileName);
    } else {
        res.redirect('/404.html');
    }
});

app.get('*', (req, res, next) => {
    if (app.isDebug && req.session.user) app.updateSessionUser(req, req.session.user);
    const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
    app.model.fwMenu.get({ link }, (error, menu) => {
        if (menu) {
            if (menu.maDonVi == '00')
                app.templates.home(req, res);
            else {
                app.templates.unit(req, res);
            }
        }
        else {
            next();
        }
    });
});

// Launch website =============================================================
require('./config/debug')(app);
server.listen(app.port, () => console.log(` - ${packageConfig.title} is ${app.isDebug ? 'debugging on ' + app.debugUrl : 'running on http://localhost:' + app.port}`));