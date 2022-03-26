module.exports = app => {
    // const privateKey = app.fs.readFileSync(app.assetPath + '/ssl/private.pem', 'utf8');
    // const publicKey = app.fs.readFileSync(app.assetPath + '/ssl/public.pem', 'utf8');
    // const signOptions = {
    //     expiresIn: '168h',
    //     algorithm: 'RS256'   // RSASSA [ "RS256", "RS384", "RS512" ]
    // };
    // const jwt = require('jsonwebtoken');

    // app.tokenAuth = {
    //     sign: data => jwt.sign(data, privateKey, signOptions),
    //     verify: (token, done) => jwt.verify(token, publicKey, done),
    // }

    // app.userType = {
    //     list: ['isStaff', 'isStudent'],
    // };

    // app.userType.list.forEach(userType => app.userType[userType] = (req, res, next) => {
    //     if (req.session.user == null) {
    //         res.send({ error: 'You are not a ' + userType.substring(2) });
    //     } else if (req.session.user[userType] == true) {
    //         next();
    //     } else {
    //         res.send({ error: 'You are not a ' + userType.substring(2) });
    //     }
    // });

    app.isGuest = (req, res, next) => {
        if (req.session.user == null) {
            next();
        } else if (req.method.toLowerCase() === 'get') {
            res.redirect('/');
        } else {
            res.send({ error: 'You has logged in!' });
        }
    };

    app.isUser = (req, res, next) => {
        if (req.session.user) {
            next();
        } else if (req.method.toLowerCase() === 'get') {
            if (req.originalUrl.startsWith('/api')) {
                res.send({ error: 'request-login' });
            } else {
                res.redirect('/request-login');
            }
        } else {
            res.send({ error: 'You must log in first!' });
        }
    };

    app.isHCMUSSH = email => email.endsWith('@hcmussh.edu.vn') ||
        email == app.defaultAdminEmail ||
        email == 'hung@hcmut.edu.vn' ||
        email == 'hoang.nguyen12@hcmut.edu.vn' ||
        email == 'tien.trantan@hcmut.edu.vn' ||
        email == 'quangsang@hcmut.edu.vn' ||
        email == 'nphien212@gmail.com' ||
        email == 'kiet.nguyenbk2804@hcmut.edu.vn' ||
        email == 'vietphap@hcmut.edu.vn';

    // app.registerUser = (req, res) => {
    //     if (req.session.user != null) {
    //         res.send({ error: 'You are logged in!' });
    //     } else {
    //         let data = {
    //             firstname: req.body.firstname.trim(),
    //             lastname: req.body.lastname.trim(),
    //             email: req.body.email.trim(),
    //             password: req.body.password,
    //             active: req.body.active == true || req.body.active == 'true' || req.body.active == 1 || req.body.active == '1' ? 1 : 0
    //         };
    //         app.model.fwUser.create(data, (error, user) => {
    //             if (error) {
    //                 res.send({ error });
    //             } else if (user == null) {
    //                 res.send({ error: 'The registration process has some errors! Please try later. Thank you.' });
    //             } else if (app.isBKer(data.email.toLowerCase())) {
    //                 res.send({ error: 'You are a member of HCMUT. Please login as HCMUT user!' });
    //             } else {
    //                 res.send({ error: null, user: app.clone({}, user, { password: null }) });

    //                 app.model.setting.getValue(['emailRegisterMemberTitle', 'emailRegisterMemberText', 'emailRegisterMemberHtml'], result => {
    //                     let url = (app.isDebug ? app.debugUrl : app.rootUrl) + '/active-user/' + user._id,
    //                         name = user.firstname + ' ' + user.lastname,
    //                         mailTitle = result.emailRegisterMemberTitle,
    //                         mailText = result.emailRegisterMemberText.replaceAll('{name}', name).replaceAll('{firstname}', firstname).replaceAll('{lastname}', lastname).replaceAll('{url}', url),
    //                         mailHtml = result.emailRegisterMemberHtml.replaceAll('{name}', name).replaceAll('{firstname}', firstname).replaceAll('{lastname}', lastname).replaceAll('{url}', url);
    //                     app.email.sendEmail(app.data.email, app.data.emailPassword, data.email, [], mailTitle, mailText, mailHtml, null);
    //                 });
    //             }
    //         });
    //     }
    // };

    // app.loginUser = (req, res) => {
    //     if (req.session.user != null) {
    //         res.send({ error: 'You are logged in!' });
    //     } else {
    //         let email = req.body.email.trim(),
    //             password = req.body.password;
    //         if (app.isBKer(email.toLowerCase())) {
    //             res.send({ error: 'Please login as HCMUT user!' });
    //         } else {
    //             app.model.fwUser.auth(email, password, async user => {
    //                 if (user == null) {
    //                     res.send({ error: 'Invalid email or password!' });
    //                 } else if (user.active) {
    //                     req.session.user = user;
    //                     let permission = [];
    //                     await user.roles.forEach(role => {
    //                         role.permission.forEach(subPermission => permission.indexOf(subPermission) == -1 && permission.push(subPermission));
    //                     });

    //                     res.send({ user: app.clone({}, user, { password: null, permission }) });
    //                 } else {
    //                     res.send({ error: 'Your account is inactive!' });
    //                 }
    //             });
    //         }
    //     }
    // };

    app.post('/logout', (req, res) => {
        if (app.casLogout && req.session.casUser) {
            app.casLogout(req, res);
        } else {
            if (req.logout) req.logout();
            if (req.session) {
                req.session.user = null;
                req.session.today = null;
            }
            res.send({ error: null, user: req.session.user });
        }
    });


    // app.loginUserOnMobile = (req, res) => {
    //     const auth = require('basic-auth');
    //     const credentials = auth(req);
    //     if (credentials) {
    //         //TODO: auth => credentials.name, credentials.pass
    //     } else {
    //         res.send({ error: 'Invalid parameters!' });
    //     }
    // };
    // app.logoutUserOnMobile = (req, res) => {
    // };
    // app.getUserOnMobile = (req, res) => {
    //     const auth = require('basic-auth');
    //     const credentials = auth(req);
    //     if (credentials) {
    //         app.tokenAuth.verify(credentials.pass, (error, decoded) => {
    //             if (error || decoded == null || credentials.name != decoded.email) {
    //                 res.send({ error: 'Invalid token!' });
    //             } else {
    //                 app.model.fwUser.get({ email: credentials.name }, (error, user) => {
    //                     if (error || user == null || user._id != decoded._id) {
    //                         res.send({ error: 'Invalid token!' });
    //                     } else {
    //                         //TODO: res.send ???
    //                     }
    //                 });
    //             }
    //         });
    //     } else {
    //         res.send({ error: 'Invalid parameters!' });
    //     }
    // }
};