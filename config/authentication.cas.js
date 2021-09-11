module.exports = (app, config) => {
    const CASAuthentication = require('cas-authentication'),
        cas = new CASAuthentication({
            cas_url: config.ssoUrl,
            service_url: config.rootUrl,
            cas_version: config.casVersion,
            renew: true,
            is_dev_mode: false,
            dev_mode_user: '',
            dev_mode_info: {},
            session_name: 'casUser',
            session_info: 'casUserInfo',
            destroy_session: true,
            logout: config.rootUrl,
        });


    // Handle the login action of cas
    app.get('/auth/cas', (req, res, next) => {
        if (req.session.casUserInfo) {
            if (req.session.user == null) { // Just login
                req.session.user = req.session.casUserInfo;
                console.log('req.session.casUserInfo', req.session.casUserInfo);

                app.model.fwUser.get({ email: req.session.casUser + '@hcmut.edu.vn' }, (error, user) => {
                    if (error || user == null) {
                        cas.logout(req, res);
                    } else {
                        app.updateSessionUser(req, user, () => res.redirect('/user'));
                    }
                });
            } else {
                res.redirect('/user');
            }
        } else {
            cas.bounce(req, res, next);
        }
    });

    app.casLogout = (req, res) => {
        console.log('TODO: detroy', req.session.st);
        try {
            cas.logout(req, res);
            res.send({ error: null });
        } catch (e) {
            res.send({ error: null });
        }
        // destroy(req.session.st, () => {
        //     res.redirect(cas.cas_url + '/logout?service=' + cas.service_url + '/');
        // });
    };
};