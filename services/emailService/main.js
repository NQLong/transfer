module.exports = (app, serviceConfig) => {
    app.service[serviceConfig.name] = {
        send: async (mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments) => {
            try {
                const item = await app.model.fwEmailTask.create({ mailFrom, mailFromPassword, mailTo, mailCc, mailSubject, mailText, mailHtml, mailAttachments, state: 'waiting', createDate: new Date().getTime() });
                app.messageQueue.send(`${serviceConfig.name}:send`, item.id);
                return null;
            } catch (error) {
                return error;
            }
        },
    };
};