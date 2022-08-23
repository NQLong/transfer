module.exports = (cluster, isDebug) => {
    let appConfig = require('../package.json');
    const express = require('express');
    const app = express();
    app.appName = appConfig.name;
    app.isDebug = isDebug;
    app.fs = require('fs');
    app.path = require('path');
    app.primaryWorker = process.env['primaryWorker'] == 'true';
    const server = app.isDebug ?
        require('http').createServer(app) :
        require('https').createServer({
            cert: app.fs.readFileSync('/etc/ssl/hcmussh_certificate.crt'),
            ca: app.fs.readFileSync('/etc/ssl/hcmussh_ca_bundle.crt'),
            key: app.fs.readFileSync('/etc/ssl/hcmussh_private.key'),
        }, app);
    if (!app.isDebug && app.fs.existsSync('./asset/config.json')) appConfig = Object.assign({}, appConfig, require('../asset/config.json'));

    // Variables ------------------------------------------------------------------------------------------------------
    app.port = appConfig.port;
    app.developers = appConfig.developers;
    app.rootUrl = appConfig.rootUrl;
    app.debugUrl = `http://localhost:${app.port}`;
    app.email = appConfig.email;
    app.apiKeySendGrid = appConfig.email.apiKeySendGrid;
    app.defaultAdminEmail = appConfig.default.adminEmail;
    app.mailSentName = appConfig.email.from;
    app.tempPath = app.path.join(__dirname, '../.temp');
    app.assetPath = app.path.join(__dirname, '../asset');
    app.bundlePath = app.path.join(app.assetPath, 'bundle');
    app.viewPath = app.path.join(__dirname, '../view');
    app.modulesPath = app.path.join(__dirname, '../modules');
    app.servicesPath = app.path.join(__dirname, '../services');
    app.publicPath = app.path.join(__dirname, '../public');
    app.imagePath = app.path.join(app.publicPath, 'img');
    app.faviconPath = app.path.join(app.imagePath, 'favicon.png');
    app.uploadPath = app.path.join(__dirname, '../asset/upload');
    app.documentPath = app.path.join(__dirname, '../asset/document');
    app.database = {};
    app.model = {};

    // Configure ------------------------------------------------------------------------------------------------------
    require('./common')(app, appConfig);
    require('./view')(app, express);
    require('./database.redisDB')(app, appConfig);
    require('./database.oracleDB')(app, appConfig);
    require('./io')(app, server, appConfig);
    require('./packages')(app, server, appConfig);
    require('./authentication')(app);
    require('./permission')(app, appConfig);
    require('./authentication.google')(app, appConfig);
    require('./rabbitmq')(app, appConfig);
    require('./tail')(app);

    // Init -----------------------------------------------------------------------------------------------------------
    app.createTemplate('home', 'admin', 'unit');
    app.loadModules();
    app.loadServices();
    app.get('/user', app.permission.check(), app.templates.admin);

    let hasUpdate = new Set(); //Mỗi lần nodemon restart nó chỉ updateSessionUser 1 lần
    app.get('*', (req, res, next) => {
        if (app.isDebug && req.session.user && !hasUpdate.has(req.session.user.email)) {
            app.updateSessionUser(req, req.session.user);
            hasUpdate.add(req.session.user.email);
        }
        const link = req.path.endsWith('/') && req.path.length > 1 ? req.path.substring(0, req.path.length - 1) : req.path;
        app.model.fwMenu.get({ link }, (error, menu) => {
            if (menu) {
                if (menu.maDonVi == '00')
                    app.templates.home(req, res);
                else {
                    app.templates.unit(req, res);
                }
            } else {
                next();
            }
        });
    });

    // Worker ---------------------------------------------------------------------------------------------------------
    app.worker = {
        create: () => process.send({ type: 'createWorker' }),
        reset: (workerId) => process.send({ type: 'resetWorker', workerId, primaryWorker: app.primaryWorker }),
        shutdown: (workerId) => process.send({ type: 'shutdownWorker', workerId, primaryWorker: app.primaryWorker }),
    };

    // Listen from MASTER ---------------------------------------------------------------------------------------------
    process.on('message', message => {
        if (message.type == 'workersChanged') {
            app.io && app.io.to('cluster').emit('services-changed');
            app.worker.items = message.workers;
        } else if (message.type == 'resetWorker') {
            server.close();
            process.exit(1);
        } else if (message.type == 'shutdownWorker') {
            process.exit(4);
        } else if (message.type == 'setPrimaryWorker') {
            app.primaryWorker = true;
        }
    });

    // Launch website -------------------------------------------------------------------------------------------------
    require('./debug')(app);
    server.listen(app.port);

    //logger
    app.setupPm2ViewLogs();
    app.intervalEmitEvent();
};