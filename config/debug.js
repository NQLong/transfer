module.exports = app => {
    // Log every request to the console
    if (app.isDebug) {
        const morgan = require('morgan');
        app.use(morgan('dev'));

        // Redirect to webpack server
        app.get('/*.js', (req, res, next) => {
            if (req.originalUrl.endsWith('.min.js')) {
                console.log(req.originalUrl);
                next();
            } else {
                const http = require('http');
                http.get('http://localhost:' + (app.port + 1) + req.originalUrl, response => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => res.send(data));
                });
            }
        });

        // Redirect to webpack server
        app.get('/*.hot-update.json', (req, res) => {
            const http = require('http');
            http.get('http://localhost:' + (app.port + 1) + req.originalUrl, response => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => res.send(data));
            });
        });

        app.post('/api/debug/change-role', (req, res) => { //TODO: delete
            new Promise((resolve, reject) => {
                app.model.fwUserRole.get({ roleId: req.body.roleId }, (error, userRole) => {
                    userRole ? resolve(userRole) : reject(error ? error : 'Debug user is not available!');
                });
            }).then(userRole => new Promise((resolve, reject) => {
                app.model.fwUser.get({ email: userRole.email }, (error, debugUser) =>
                    debugUser ? resolve(debugUser) : reject(error ? error : 'Debug user is not available!'));
            })).then(debugUser => {
                console.log(` - Debug as ${debugUser.email}!`);
                app.updateSessionUser(req, debugUser, () => res.send({}));
            }).catch(error => res.send({ error }));
        });
    }

    app.post('/api/debug/switch-user', (req, res) => {
        const personId = req.body.personId,
            isDebug = app.isDebug || (req.session.user && req.session.user.roles.filter(role => role.name == 'admin').length);
        if (personId && isDebug) {
            app.model.canBo.get({ shcc: personId }, (error, canBo) => {
                if (error) {
                    res.send({ error: 'System has errors!' });
                } else if (canBo) {
                    app.model.fwUser.get({ email: canBo.email }, (error, user) => {
                        if (error || user == null) {
                            app.model.fwUser.create({ email: canBo.email, lastName: canBo.ho, firstName: canBo.ten, active: 1, isStudent: 0, isStaff: 1, shcc: personId, studentId: '' }, (error, user) => {
                                if (error || user == null) {
                                    res.send({ error: 'System has errors!' });
                                } else {
                                    app.updateSessionUser(req, user, () => res.send({ user }));
                                }
                            });
                        } else {
                            app.updateSessionUser(req, user, () => res.send({ user }));
                        }
                    });
                } else {
                    app.model.fwUser.get({ email: personId }, (error, user) => {
                        if (error) {
                            res.send({ error: 'System has errors!' });
                        } else if (user) {
                            app.updateSessionUser(req, user, () => res.send({ user }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid request!' });
        }
    });

    app.use((req, res) => {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            return res.redirect('/404.html');
        }

        // respond with json
        if (req.accepts('json')) {
            return res.send({ error: 'Not found!' });
        }
    });
};