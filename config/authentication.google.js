module.exports = (app) => {
    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    const GoogleStrategyConfig = {
        clientID: '318805336792-3g9b03uc6tk8b6ra1v49otm7ajddb8oi.apps.googleusercontent.com',
        clientSecret: '5m_LfDfX9sEXixR9G4qMJwc5',
        callbackURL: '/auth/google/callback'
    };

    passport.use(new GoogleStrategy(GoogleStrategyConfig, (accessToken, refreshToken, profile, done) => {
        // Check no email
        if (profile.emails.length == 0) {
            return done(null, false, { 'loginMessage': 'Fail to login!' });
        }

        // Check wether you are BKer or not
        const email = profile.emails[0].value;
        if (!app.isHCMUSSH(email) && !(app.isDebug && email.endsWith('@gmail.com'))) {
            return done(null, false, { 'loginMessage': 'Fail to login!' });
        }

        // Get user info
        let firstname = 'firstname', lastname = 'lastname';
        if (profile && profile.name) {
            if (profile.name.givenName) firstname = profile.name.givenName;
            if (profile.name.familyName) lastname = profile.name.familyName;
        }

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
        console.log('successRedirect', req.user);
        app.updateSessionUser(req, req.user, sessionUser => res.redirect('/user'));
    });
};