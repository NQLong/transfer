module.exports = (app, http) => {
    app.io = require('socket.io')(http);
    app.onRedisConnect = () => {
        const { createAdapter } = require('socket.io-redis');
        app.io.adapter(createAdapter({ pubClient: app.redis, subClient: app.redis.duplicate() }));
        app.io.on('connection', socket => app.onSocketConnect(socket));
    };

    if (app.isDebug) {
        app.fs.watch('public/js', () => {
            console.log('Reload client!');
            app.io.emit('debug', 'reload');
        });
    }
};