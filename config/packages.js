module.exports = (app, http, config) => {
    // Libraries
    require('./lib/utils')(app);
    require('./lib/fs')(app);
    require('./lib/string')(app);
    require('./lib/date')(app);
    require('./lib/array')(app);
    require('./lib/email')(app);
    require('./lib/excel')(app);
    require('./lib/schedule')(app);
    require('./lib/language')(app);
    require('./lib/docx')(app);
    require('./lib/sms')(app);
    require('./lib/hooks')(app);

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

    if (config && app.database.redis) {
        const redisStore = require('connect-redis')(session);
        sessionOptions.store = new redisStore({ client: app.database.redis, prefix: sessionIdPrefix });
        app.use(session(sessionOptions));
    }

    app.session = {
        getId: req => sessionIdPrefix + req.sessionID,

        deleteByCasTicket: (casTicket) => {
            app.database.redis && app.database.redis.keys(sessionIdPrefix + '*', (error, keys) => {
                if (keys && keys.length) {
                    const solve = (index = 0, step = 50) => {
                        if (index < keys.length) {
                            const subKeys = keys.slice(index, index + step);
                            app.database.redis.mget(subKeys, (error, items) => {
                                if (items) {
                                    for (let i = 0; i < subKeys.length; i++) {
                                        const key = subKeys[i], item = JSON.parse(items[i]);
                                        // Delete user's session
                                        if (item && item.casTicket == casTicket) {
                                            const { email, shcc, studentId } = item.user;
                                            delete item.casTicket;
                                            delete item.casUser;
                                            delete item.casUserInfo;
                                            delete item.user;
                                            app.database.redis.set(key, JSON.stringify(item), () => {
                                                console.log(' - Delete session ticket:', casTicket);
                                                app.io.emit('force', 'logout', { email, shcc, studentId });
                                            });
                                        }
                                    }
                                }

                                solve(index + step);
                            });
                        }
                    };
                    solve();
                }
            });
        },

        refresh: (...emails) => {
            app.database.redis && app.database.redis.keys(sessionIdPrefix + '*', (error, keys) => {
                if (keys && keys.length) {
                    const solve = (index = 0, step = 50) => {
                        if (index < keys.length) {
                            const subKeys = keys.slice(index, index + step);
                            app.database.redis.mget(subKeys, (error, items) => {
                                if (items) {
                                    for (let i = 0; i < subKeys.length; i++) {
                                        const key = subKeys[i], item = JSON.parse(items[i]);
                                        // Refresh user's session
                                        if (item && item.user && emails.includes(item.user.email)) {
                                            app.model.fwUser.get({ email: item.user.email }, (error, user) => {
                                                user && app.updateSessionUser(null, user, sessionUser => {
                                                    if (sessionUser) {
                                                        item.user = sessionUser;
                                                        app.database.redis.set(key, JSON.stringify(item), () => console.log(' - Update session', key, ':', sessionUser.email));
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }

                                solve(index + step);
                            });
                        }
                    };
                    solve();
                }
            });
        }
    };

    // Read cookies (needed for auth)
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

    // Multi upload
    const multiparty = require('multiparty');
    app.getUploadForm = () => new multiparty.Form({ uploadDir: app.uploadPath });

    // Image processing library
    app.jimp = require('jimp');
};