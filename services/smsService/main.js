module.exports = (app, serviceConfig) => {
    // Các chức năng của service
    app.service[serviceConfig.name] = {
        send: (phoneNumber, content) => app.messageQueue.send(`${serviceConfig.name}:send`, { phoneNumber, content }),
    };
};