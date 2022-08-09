module.exports = (cluster, isDebug) => {
    let appConfig = require('../package.json');
    const app = require('express')(),
        compression = require('compression'),
        bodyParser = require('body-parser');
    app.use(compression());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
    app.isDebug = isDebug;
    app.fs = require('fs');
    app.path = require('path');
    require('./lib/common')(app);
    require('./lib/fs')(app);
    require('./lib/string')(app);
    require('./lib/date')(app);
    require('./lib/array')(app);
    require('./lib/excel')(app);
    app.primaryWorker = process.env['primaryWorker'] == 'true';
    app.assetPath = app.path.join(__dirname, '../asset');
    app.bundlePath = app.path.join(app.assetPath, 'bundle');
    app.uploadPath = app.path.join(app.assetPath, 'upload');
    app.database = {};
    app.model = {};
    if (!app.isDebug && app.fs.existsSync('./asset/config.json')) appConfig = Object.assign({}, appConfig, require('../asset/config.json'));
    app.createFolder(app.assetPath, app.bundlePath, app.uploadPath);

    // Worker ---------------------------------------------------------------------------------------------------------
    app.worker = {
        create: () => process.send({ type: 'createWorker' }),
        reset: (workerId) => process.send({ type: 'resetWorker', workerId, primaryWorker: app.primaryWorker }),
        shutdown: (workerId) => process.send({ type: 'shutdownWorker', workerId, primaryWorker: app.primaryWorker }),
    };

    // Listen from MASTER ---------------------------------------------------------------------------------------------
    process.on('message', message => {
        if (message.type == 'workersChanged') {
            app.worker.items = message.workers;
        } else if (message.type == 'resetWorker') {
            app.messageQueue && app.messageQueue.connection && app.messageQueue.connection.close();
            server && server.close();
            process.exit(1);
        } else if (message.type == 'shutdownWorker') {
            process.exit(4);
        } else if (message.type == 'setPrimaryWorker') {
            app.primaryWorker = true;
        }
    });

    // Init RabbitMQ --------------------------------------------------------------------------------------------------
    require('./rabbitmq')(app, appConfig);

    // Connect databases ----------------------------------------------------------------------------------------------
    app.fs.existsSync('./config/database.redisDB.js') && require('./database.redisDB.js');
    app.fs.existsSync('./config/database.oracleDB.js') && require('./database.oracleDB.js')(app, appConfig);
    app.fs.existsSync('./config/database.mongoDB.js') && require('./database.mongoDB.js');
    app.fs.existsSync('./config/database.elasticSearch.js') && require('./database.elasticSearch.js');

    // Load models ----------------------------------------------------------------------------------------------------
    const requireFolder = (loadPath, configData) => app.fs.readdirSync(loadPath).forEach((filename) => {
        const filepath = app.path.join(loadPath, filename);
        if (app.fs.existsSync(filepath)) {
            const fileState = app.fs.statSync(filepath);
            if (fileState.isFile() && filepath.endsWith('.js')) {
                require(filepath)(app, configData);
            } else if (fileState.isDirectory()) {
                requireFolder(filepath, configData);
            }
        }
    });
    requireFolder(app.path.join(__dirname, '../models'));

    // Load service ---------------------------------------------------------------------------------------------------
    app.service = { main: {} };
    const axios = require('axios'),
        axiosRequest = async (type, url, data, requestConfig) => {
            try {
                if (!data) data = {};
                if (!requestConfig) requestConfig = {};
                if (type == 'get') {
                    const params = new URLSearchParams(data).toString();
                    if (params.length) url = url + (url.includes('?') ? '&' : '?') + params;
                    data = {};
                } else if (type == 'delete') {
                    data = { data };
                }
                const response = await axios[type](appConfig.mainUrl + url, data, requestConfig);
                return response ? response.data : null;
            } catch (error) {
                return { error };
            }
        };
    ['get', 'post', 'put', 'delete'].forEach(type => app.service.main[type] = async (url, data, requestConfig) => await axiosRequest(type, url, data, requestConfig));
    require('../services/service')(app, { name: appConfig.name, mainUrl: appConfig.mainUrl, isDebug: false });

    // Start Express server if necessary ------------------------------------------------------------------------------
    const server = require('http').createServer(app);
    server.listen(appConfig.port);
};