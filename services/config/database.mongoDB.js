module.exports = (app, appConfig) => {
    const mongodbConnectionString = `mongodb://${appConfig.mongoDB.host}:${appConfig.mongoDB.port}/${appConfig.mongoDB.name}`;
    app.database.mongoDB = require('mongoose');
    app.database.mongoDB.set('useUnifiedTopology', true);
    app.database.mongoDB.connect(mongodbConnectionString, { useNewUrlParser: true });
    app.database.mongoDB.connection.on('error', () => console.log(` - #${process.pid}: The MongoDB connection failed!`));
    app.database.mongoDB.connection.once('open', () => console.log(` - #${process.pid}: The MongoDB connection succeeded.`));
};