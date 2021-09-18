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