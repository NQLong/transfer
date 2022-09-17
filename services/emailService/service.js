module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);

    if (!app.isDebug) app.assetPath = '/var/www/hcmussh/asset';

    const nodemailer = require('nodemailer'),
        transporters = {};
    const sendMail = async (mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments) => new Promise(resolve => {
        if (!transporters[mailFrom]) {
            transporters[mailFrom] = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                auth: { user: mailFrom, pass: mailFromPassword },
                debug: true
            });
            transporters[mailFrom].on('log', console.log);
        }
        const transporter = transporters[mailFrom];

        const mailOptions = {
            from: mailFrom,
            cc: mailCc.toString(),
            to: mailTo,
            subject: mailSubject,
            text: mailText,
            html: mailHtml,
            attachments: mailAttachments
        };
        transporter.sendMail(mailOptions, error => {
            error ? console.error(error) : console.log(`Send mail to ${mailTo} successful!`);
            resolve(error);
        });
    });

    app.messageQueue.consume(`${serviceConfig.name}:send`, async (id) => {
        try {
            const item = await app.model.fwEmailTask.get({ id });
            if (item) {
                const { mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, state } = item;
                if (state == 'waiting' && mailFrom && mailFromPassword) {
                    const error = await sendMail(mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments);
                    error && console.error(serviceConfig.name, error);
                    app.model.fwEmailTask.update({ id }, { state: 'Error' || 'Success' });
                }
            }
        } catch (error) {
            console.error(`Error: ${serviceConfig.name}:send:`, error);
            // app.messageQueue.send(`${serviceConfig.name}:sendResult`, { error });
        }
    });
};