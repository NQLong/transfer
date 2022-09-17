module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);

    if (!app.isDebug) app.assetPath = '/var/www/hcmussh/asset';

    const nodemailer = require('nodemailer'),
        transporters = {},
        delay = ms => new Promise(res => setTimeout(res, ms));
    const sendMail = async (mailFrom, mailFromPassword, mailTo, cc = null, bcc = null, subject, text, html, attachments = null) => {
        try {
            let transporter = transporters[mailFrom];
            if (!transporter) {
                transporter = nodemailer.createTransport({
                    pool: true,
                    host: 'smtp.gmail.com',
                    port: 465,
                    auth: { user: mailFrom, pass: mailFromPassword },
                    debug: true
                });
                transporter.on('log', console.log);
                transporters[mailFrom] = transporter;
            }

            const message = { from: mailFrom, to: mailTo, subject, text, html, attachments };
            if (cc) message.cc = cc.toString();
            if (bcc) message.bcc = bcc.toString();

            await transporter.sendMail(message);
            await delay(5000);
            return null;
        } catch (error) {
            console.log(`Send mail to ${mailTo} error!`, error);
            return error;
        }
    };

    app.messageQueue.consume(`${serviceConfig.name}:send`, async (id) => {
        try {
            const item = await app.model.fwEmailTask.get({ id });
            if (item) {
                const { mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments, state } = item;
                if (state == 'waiting') {
                    if (mailFrom && mailFromPassword) {
                        const error = await sendMail(mailFrom, mailFromPassword, mailTo, mailCc, mailBcc, mailSubject, mailText, mailHtml, mailAttachments);
                        error && console.error(serviceConfig.name, error);
                        app.model.fwEmailTask.update({ id }, { state: 'Error' || 'Success' });
                    } else {
                        app.model.fwEmailTask.update({ id }, { state: 'Error' });
                    }
                }
            }
        } catch (error) {
            console.error(`Error: ${serviceConfig.name}:send:`, error);
            // app.messageQueue.send(`${serviceConfig.name}:sendResult`, { error });
        }
    });
};