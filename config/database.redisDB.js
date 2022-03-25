module.exports = (app, appConfig) => {
    const redisDB = appConfig.redisDB;
    const redis = require('redis');
    app.redis = app.isDebug ?
        redis.createClient() :
        redis.createClient({ host: redisDB.host, port: redisDB.port, password: redisDB.auth });

    app.redis.on('connect', () => {
        console.log(` - #${process.pid}: The Redis connection succeeded.`);
        app.onRedisConnect();
    });

    app.redis.on('error', error => {
        console.log(` - #${process.pid}: The Redis connection failed!`, error.message);
        app.redis.end(true);
    });
};
