module.exports = app => {
    const sgMail = require('@sendgrid/mail');

    app.email = {
        sendEmail: (mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, successCallback) => {
            sgMail.setApiKey(app.apiKeySendGrid);
            const msg = {
                to: mailTo, // Change to your recipient
                from: app.mailSentName, // Change to your verified sender
                subject: mailSubject,
                html: mailHtml,
            };
            sgMail.send(msg).then(() => {
                console.log('Email sent');
                successCallback('success');
            }).catch((error) => {
                successCallback('success');
                console.log('Send email by Sendgrid fail', mailTo, error);
                // let transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     service: 'gmail',
                //     port: 8002,
                //     secure: true,
                //     auth: { user: 'nhanvan@hcmussh.edu.vn', pass: 'Nhanvan2020' },
                // });
                // transporter.on('log', console.log);
                // const mailOptions = {
                //     from: app.mailSentName,
                //     cc: (mailCc || '').toString(),
                //     to: mailTo,
                //     subject: mailSubject,
                //     text: mailText,
                //     html: mailHtml,
                //     attachments: mailAttachments
                // };
                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         console.log(error);
                //         if (errorCallback) errorCallback(error);
                //     } else {
                //         console.log('Send mail to ' + mailTo + ' successful.');
                //         if (successCallback) successCallback();
                //     }
                // });
            });

        },

        validateEmail: email => {
            return (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase());
        },

        isHCMUSSH: email => {
            return email.endsWith('@hcmussh.edu.vn');
        }
    };

    //Nodemailer
    const nodemailer = require('nodemailer');

    app.email.normalSendEmail = (mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, successCallback, errorCallback) => new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: { user: mailFrom, pass: mailFromPassword },
            debug: true
        });
        transporter.on('log', console.log);

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
            if (error) {
                console.error(error);
                if (errorCallback) errorCallback(error);
                reject(error);
            } else {
                console.log('Send mail to ' + mailTo + ' successful.');
                if (successCallback) successCallback();
                resolve();
            }
        });
    });

};