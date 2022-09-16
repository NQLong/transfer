module.exports = (app, serviceConfig) => {
    app.permission = {
        isLocalIp: (req, res, next) => { // ::ffff:10.22.1.53
            const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
            app.isDebug || ip.startsWith(serviceConfig.localIpPrefix) || ip.startsWith('::ffff:' + serviceConfig.localIpPrefix) ?
                next() : res.send({ error: 'Invalid IP!' });
        },
    };
};