module.exports = (app) => {
    const { OAuth2Client } = require('google-auth-library');
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    const GoogleStrategyConfig = {
        clientID: '318805336792-3g9b03uc6tk8b6ra1v49otm7ajddb8oi.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: '/auth/google/callback'
    };

    passport.use(new GoogleStrategy(GoogleStrategyConfig, async (accessToken, refreshToken, profile, done) => {
        // Check no email
        if (profile.emails.length == 0) {
            return done(null, false, { 'loginMessage': 'Fail to login!' });
        }

        // Check wether you are HCMUSSH or not
        const email = profile.emails[0].value;

        const isAdmin = await app.isAdmin(email);

        if (!(isAdmin || app.isHCMUSSH(email) || (app.isDebug && email.endsWith('@gmail.com')))) {
            return done(null, false, { 'loginMessage': 'Fail to login!' });
        }

        // Get user info
        // let firstname = 'firstname', lastname = 'lastname';
        // if (profile && profile.name) {
        //     if (profile.name.givenName) firstname = profile.name.givenName;
        //     if (profile.name.familyName) lastname = profile.name.familyName;
        // }

        // Return Google user
        app.model.fwUser.get({ email }, (error, user) => {
            if (error) {
                done(error);
            } else if (user) {
                done(null, user);
            } else {
                app.model.fwUser.create({ email, active: 1 }, done);
            }
        });
    }));

    // Configure Passport authenticated session persistence
    passport.serializeUser((user, done) => done(null, user.email));
    passport.deserializeUser((email, done) => app.model.fwUser.get({ email }, done));

    // Initialize Passport and restore authentication state, if any, from the session.
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions

    // Make sure a user is logged in
    app.isLoggedIn = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next(); // If user is authenticated in the session, carry on
        } else {
            res.redirect('/login'); // If they aren't redirect them to the home page
        }
    };

    // Do Google login action
    app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
    // Do Google login callback action
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login-fail' }), (req, res) => {
        // const redirectUrl = req.cookies.userUrl && req.cookies.userUrl.startsWith('/user') ? req.cookies.userUrl : '/user';
        // const processRoute = req.session.processRoute;
        app.updateSessionUser(req, req.user, () => {
            res.redirect('/user');
            // delete req.session.processRoute;
        });
        // app.updateSessionUser(req, req.user, () => res.redirect('/user'));
    });

    app.googleO2client = new OAuth2Client(GoogleStrategyConfig.clientID);
    app.verifyIdToken = async (token) => {
        const ticket = await app.googleO2client.verifyIdToken({
            idToken: token,
            audience: GoogleStrategyConfig.clientID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        return payload;
    };

    app.post('/auth/mobile/signin', async (req, res) => {
        try {
            const { idToken, email } = req.body;
            let userEmail = '';
            if (idToken) {
                const userInfo = await app.verifyIdToken(idToken);
                userEmail = userInfo?.email;
            } else if (app.isDebug) {
                userEmail = email;
            }
            if (!userEmail)
                throw 'Tài khoản không hợp lệ';
            else {
                const user = await app.model.fwUser.get({ email: userEmail });
                console.log({userEmail, user});
                if (!user) throw 'Tài khoản không tồn tại';
                app.updateSessionUser(req, user, () => {
                    res.send({ message: 'Đăng nhập thành công', email: user.email });
                });
            }
        }
        catch (error) {
            res.status(401).send({ message: 'Đăng nhập không thành công', error });
        }
    });
};