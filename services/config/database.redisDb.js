module.exports = (app, appConfig) => {
    // Connect RedisDB ------------------------------------------------------------------------------------------------------------------------------
    const redisDB = appConfig.redisDB;
    const redis = require('redis');
    app.database.redis = redis.createClient(redisDB);
    app.database.redis.on('connect', () => {
        console.log(` - #${process.pid}: The Redis connection succeeded.`);
    });
    app.database.redis.on('error', error => {
        console.log(` - #${process.pid}: The Redis connection failed!`, error.message);
        app.database.redis.end(true);
    });
};