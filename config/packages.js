module.exports = (app, http, config) => {
    app.url = require('url');

    // Protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
    const helmet = require('helmet');
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.xssFilter());
    app.use(helmet.permittedCrossDomainPolicies());
    // app.use(helmet.noCache());
    // app.use(helmet.referrerPolicy());

    // Get information from html forms
    const bodyParser = require('body-parser');
    const cors = require('cors');

    app.use(cors());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

    // Cryptography
    app.crypt = require('bcrypt');
    app.getToken = length => Array(length).fill('~!@#$%^&*()0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').map(x => x[Math.floor(Math.random() * x.length)]).join('');
    // app.sha256 = require('crypto-js/sha256');

    // Configure session
    app.set('trust proxy', 1); // trust first proxy
    const sessionIdPrefix = config.name + '_sess:', session = require('express-session');
    const sessionOptions = {
        secret: 'W6T55k2vLdgvNh8fkkVzF4WRpaASmW9vET87CDzRqdSTHU6yNDyN6AmHeWmMSqxjzAmuvpsd9ben9KBekdupQS6ptz97A6YaY4Q',
        key: 'dhkhxhnv-dhbk-dhqgtphcm',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3600000 * 24 * 7// one week
        }
    };

    app.readyHooks.add('redisStore', {
        ready: () => config && app.redis,
        run: () => {
            // console.log(` - #${process.pid}: The system used Redis session!`);
            const redisStore = require('connect-redis')(session);
            sessionOptions.store = new redisStore({ client: app.redis, prefix: sessionIdPrefix });
            app.use(session(sessionOptions));
        }
    });

    // Read cookies (needed for auth)
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    // Multi upload
    const multiparty = require('multiparty');
    app.getUploadForm = () => new multiparty.Form({ uploadDir: app.uploadPath });

    // Image processing library
    app.jimp = require('jimp');

    // Libraries
    require('./lib/fs')(app);
    require('./lib/string')(app);
    require('./lib/date')(app);
    require('./lib/array')(app);
    require('./lib/email')(app);
    require('./lib/excel')(app);
    require('./lib/schedule')(app);
    require('./lib/language')(app);
    require('./lib/docx')(app);
};