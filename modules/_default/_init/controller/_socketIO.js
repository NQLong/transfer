module.exports = app => {

    app.onSocketConnect = socket => {
        // console.log('A user connected.');
        // socket.on('disconnect', () => console.log('A user disconnected'));

        // Authenticate ------------------------------------------------------------------------------------------------
        socket.on('user:login', (email, password) => app.loginUserOnMobile(socket, email, password));
        socket.on('user:logout', () => app.logoutUserOnMobile(socket));
        socket.on('user:register', (name, phoneNumber, email, password) => app.registerUserOnMobile(socket, name, phoneNumber, email, password));

        // User --------------------------------------------------------------------------------------------------------
        socket.on('user:update', (name, phoneNumber) => {
            if (socket.user) {
                let changes = {};
                if (name && name !== '') changes.name = name;
                if (phoneNumber) changes.phoneNumber = phoneNumber;

                if (Object.keys(changes).length > 0) {
                    app.model.fwUser.update({ email: socket.user.email }, changes, (error, user) => {
                        if (error) {
                            console.error('Error: socket->user:update', error);
                            socket.emit('user:update', 'Some errors occurred during save your profile!');
                        } else {
                            socket.emit('user:update', null, user);
                            socket.user = user;
                        }
                    });
                } else {
                    socket.emit('user:update', null, socket.user);
                }
            } else {
                socket.emit('user:update', 'You must login first!');
            }
        });
        socket.on('user:change-avatar', () => {
            let taskName = 'user:change-avatar:' + socket.user._id,
                taskToken = app.getToken(12);
            app.model.task.create(taskName, taskToken, () => socket.emit('user:task-token', 'user:change-avatar', taskToken));
        });

        // Receive token of mobile -------------------------------------------------------------------------------------
        socket.on('api:mobile-token', token => app.model.mobile.create({ token }, error => {
            if (error) {
                console.error('API Error: mobile-token:', error);
            } else {
                console.log('API: mobile-token: add', token);
            }
        }));

        // Contact -----------------------------------------------------------------------------------------------------
        socket.on('contact:message', (email, title, message) =>
            app.model.contact.create({ email, title, message }, (error) => {
                if (error) {
                    console.error('IO:contact:message', error);
                } else {
                    app.model.setting.getValue(['email', 'emailPassword', 'emailContactTitle', 'emailContactText', 'emailContactHtml'], result => {
                        let mailTitle = result.emailContactTitle,
                            mailText = result.emailContactText.replaceAll('{title}', title).replaceAll('{message}', message),
                            mailHtml = result.emailContactHtml.replaceAll('{title}', title).replaceAll('{message}', message);
                        app.email.sendEmail(result.email, result.emailPassword, email, [app.defaultAdminEmail], mailTitle, mailText, mailHtml, null);
                    });
                }
                socket.emit('contact:message', error);
            }));
    };
};