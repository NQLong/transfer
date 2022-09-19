module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);

    // eslint-disable-next-line no-control-regex
    const checkNonLatinChar = (string) => /[^\u0000-\u00ff]/.test(string);
    const http = require('http');
    app.messageQueue.consume(`${serviceConfig.name}:send`, async (message) => {
        try {
            const { phoneNumber, content } = JSON.parse(message);
            console.log('Send SMS:', phoneNumber, content);
            let { usernameViettel: user, passViettel: pass, brandName, } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);
            let dataEncode = parseInt(checkNonLatinChar(content));

            const tranId = `${phoneNumber}_${new Date().getTime()}`;
            const dataRequest = JSON.stringify({ user, pass, tranId, phone: phoneNumber, dataEncode, mess: content, brandName });
            const option = {
                host: '125.212.226.79',
                port: 9020,
                path: '/service/sms_api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return new Promise(resolve => {
                const request = http.request(option, (_res) => {
                    _res.on('data', async (chunk) => {
                        let resData = {};
                        try {
                            resData = JSON.parse(chunk.toString());
                        } catch (e) {
                            console.error(e);
                            resolve({ error: e });
                        }
                        if (resData.code == 1) {
                            try {
                                resolve({ success: true });
                            } catch (error) {
                                resolve({ error });
                            }
                        } else resolve({ error: 'Unsuccessful request' });
                    });
                });
                request.on('error', (e) => {
                    resolve({ error: `Problem with request to viettel: ${e.message}` });
                });
                request.write(dataRequest);
                request.end();
            });
        } catch (error) {
            console.error(`Error: ${serviceConfig.name}:importDbCore:`, error);
            app.messageQueue.send(`${serviceConfig.name}:importDbCoreResult`, { error });
        }
    });
};