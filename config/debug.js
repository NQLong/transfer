module.exports = app => {
    // Log every request to the console
    if (app.isDebug) {
        const morgan = require('morgan');
        app.use(morgan('dev'));

        // Redirect to webpack server
        app.get('/*.js', (req, res, next) => {
            if (req.originalUrl.endsWith('.min.js')) {
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

    app.post('/api/debug/switch-user', async (req, res) => {
        try {
            const personId = req.body.personId,
                isDebug = app.isDebug || (req.session.user?.permissions?.length && req.session.user.permissions.includes('developer:login'));
            if (personId && isDebug) {
                const canBo = await app.model.canBo.get({ shcc: personId });
                if (canBo) {
                    const user = { email: canBo.email, lastName: canBo.ho, firstName: canBo.ten, active: 1, isStaff: 1, shcc: personId };
                    app.updateSessionUser(req, user, () => res.send({ user }));
                } else {
                    const sinhVien = await app.model.fwStudents.get({ mssv: personId });
                    if (sinhVien) {
                        const user = { email: sinhVien.emailTruong, lastName: sinhVien.ho, firstName: sinhVien.ten, active: 1, isStudent: 1, studentId: personId };
                        app.updateSessionUser(req, user, () => res.send({ user }));
                    } else {
                        const user = await app.model.fwUser.get({ email: personId });
                        if (user) app.updateSessionUser(req, user, () => res.send({ user }));
                        else res.send({ error: 'System has errors!' });
                    }
                }
            } else {
                res.send({ error: 'Invalid request!' });
            }
        } catch (error) {
            res.send({ error: `System has errrors: ${error}` });
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