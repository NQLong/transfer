module.exports = (app, serviceConfig) => { // Run on service project
    require('../config/initService')(app, serviceConfig);

    // eslint-disable-next-line no-control-regex
    const checkNonLatinChar = (string) => /[^\u0000-\u00ff]/.test(string);
    const http = require('http');
    app.messageQueue.consume(`${serviceConfig.name}:send`, async (message) => {
        try {
            const { phoneNumber, content } = JSON.parse(message);
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

            const request = http.request(option, (_res) => {
                _res.on('data', (chunk) => {
                    try {
                        const dataResponse = JSON.parse(chunk.toString());
                        dataResponse.code == 1 ?
                            console.log(`${serviceConfig.name}:send: ${phoneNumber}: ${content}`) :
                            console.error(`${serviceConfig.name}:send: Unsuccessful request`);
                    } catch (error) {
                        console.error(`${serviceConfig.name}:send:`, error);
                    }
                });
            });
            request.on('error', error => {
                console.error(`${serviceConfig.name}:send: Problem with request to Viettel`, error);
            });
            request.write(dataRequest);
            request.end();
        } catch (error) {
            console.error(`${serviceConfig.name}:send:`, error);
        }
    });
};