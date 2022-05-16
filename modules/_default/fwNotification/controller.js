module.exports = app => {
    // Settings --------------------------------------------------------------------------------------------------------
    app.notification = {
        send: ({ toEmail = '', title = '', subTitle = '', icon = 'fa-commenting', iconColor = '#1488db', link = '', buttons = [], sendEmail = null, sendSocket = true }) => new Promise((resolve, reject) => {
            // Validate data
            if (!toEmail) return reject('The email to send notification is empty!');
            if (!app.email.validateEmail(toEmail)) return reject('The email to send notification is invalid!');
            if (!title) return reject('The title of notification is empty!');
            // Convert iconColor
            switch (iconColor) {
                case 'primary': {
                    iconColor = '#1488db';
                    break;
                }
                case 'secondary': {
                    iconColor = '#6c757d';
                    break;
                }
                case 'success': {
                    iconColor = '#28a745';
                    break;
                }
                case 'info': {
                    iconColor = '#17a2b8';
                    break;
                }
                case 'warning': {
                    iconColor = '#ffc107';
                    break;
                }
                case 'danger': {
                    iconColor = '#dc3545';
                    break;
                }
                case 'light': {
                    iconColor = '#f8f9fa';
                    break;
                }
                case 'dark': {
                    iconColor = '#343a40';
                    break;
                }
                default: break;
            }
            // Convert buttons
            if (!Array.isArray(buttons)) buttons = [buttons];
            try {
                buttons = JSON.stringify(buttons);
            } catch {
                buttons = '[]';
            }
            // Create notification item:
            const newNotification = { email: toEmail, title, subTitle, icon, iconColor, targetLink: link, buttonLink: buttons, sendTime: new Date().getTime() };
            app.model.fwNotification.create(newNotification, (error, item) => {
                if (error || !item) {
                    reject(error || 'System has error when creating new notification');
                } else {
                    if (sendSocket) {
                        app.io.emit('receive-notification', toEmail, item);
                    }

                    if (sendEmail) {
                        sendEmail(() => resolve(item));
                    } else {
                        resolve(item);
                    }
                }
            });
        })
    };

    // API -------------------------------------------------------------------------------------------------------------
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1020: { title: 'Thông báo', link: '/user/notification', icon: 'fa-bell-o', backgroundColor: '#FABE4F', pin: true }
        },
    };
    app.permission.add({ name: 'user:login', menu });
    app.get('/user/notification', app.permission.check('user:login'), app.templates.admin);

    app.get('/api/notification/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber), pageSize = parseInt(req.params.pageSize);
        const condition = {
            email: req.session.user.email,
        };
        if (req.query.read) {
            condition.read = Number(req.query.read);
        }
        app.model.fwNotification.getPage(pageNumber, pageSize, condition, '*', 'sendTime desc', (error, page) => res.send({ error, page }));
    });

    app.get('/api/notification/item/:id', app.permission.check('user:login'), (req, res) => {
        const action = req.query.action || '';
        const condition = {
            id: req.params.id,
            email: req.session.user.email
        };
        app.model.fwNotification.update(condition, { read: 1, action }, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/notification', app.permission.check('user:login'), (req, res) => {
        const condition = {
            id: req.body.id,
            email: req.session.user.email
        };
        app.model.fwNotification.delete(condition, (error) => res.send({ error }));
    });
};