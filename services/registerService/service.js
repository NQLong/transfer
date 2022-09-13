module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);
};