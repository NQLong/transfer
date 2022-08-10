module.exports = (app, appConfig) => {
    let consumeContainer = [];
    app.messageQueue = {
        consume: (queue, callBack) => consumeContainer.push({ queue, callBack }),
    };

    const amqp = require('amqplib');
    amqp.connect('amqp://' + appConfig.rabbitMQ.ip).then(connection => {
        console.log(` - #${process.pid}: The Amqp connection succeeded.`);
        app.messageQueue.connection = connection;
        return connection.createChannel();
    }).then(channel => {
        app.messageQueue.send = (queue, message) => {
            if (typeof message == 'object') message = JSON.stringify(message);
            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue, Buffer.from(message));
        };

        app.messageQueue.consume = (queue, callBack) => {
            channel.assertQueue(queue, { durable: false });
            channel.consume(queue, message => callBack(message.content.toString()), { noAck: true });
        };

        consumeContainer.forEach(({ queue, callBack }) => app.messageQueue.consume(queue, callBack));
        consumeContainer = null;
    }).catch(() => {
        app.messageQueue = { isUnavailable: true };
        console.log(` - #${process.pid}: The Amqp connection failed!`);
    });
};