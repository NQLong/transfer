module.exports = app => {
    const http = require('http');
    app.permission.add('fwSms-viettel:send');

    // eslint-disable-next-line no-control-regex
    const checkNonLatinChar = (string) => /[^\u0000-\u00ff]/.test(string);
    app.post('/api/sms-service/viettel', app.permission.check('fwSms-viettel:send'), async (req, res) => {
        try {
            let { usernameViettel: user, passViettel: pass, brandName, totalSMSViettel: currentTotal } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);
            let { phone, mess } = req.body;
            // let user = 'demo_sms',
            //     pass = 'DemoSMS@#123',
            //     brandName = 'MobiService',
            //     phone = '0901303938', //temp
            //     mess = 'Chuc mung sinh nhat quy khach hang'; //temp
            let dataEncode = 0;
            if (checkNonLatinChar(mess)) dataEncode = 1;
            const tranId = `${phone}_${new Date().getTime()}`;
            const dataRequest = JSON.stringify({ user, pass, tranId, phone, dataEncode, mess, brandName });
            const option = {
                host: '125.212.226.79',
                port: 9020,
                path: '/service/sms_api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };

            const request = http.request(option, (_res) => {
                _res.on('data', async (chunk) => {
                    let resData = {};
                    try {
                        resData = JSON.parse(chunk.toString());
                    } catch (e) {
                        console.error(e);
                    }

                    if (resData.code == 1) {
                        try {
                            const item = await app.model.fwSms.create({
                                email: req.session.user.email,
                                sentDate: new Date().getTime(),
                                total: Math.abs(currentTotal - resData.total)
                            });

                            if (item) {
                                app.model.setting.setValue({ totalSMSViettel: resData.total }, () => res.send({ item }));
                            }
                            else res.end();
                        } catch (error) {
                            res.send({ error });
                        }
                    } else res.send({ error: 'Unsuccessful request' });
                });
            });
            request.on('error', (e) => {
                console.error(`problem with request to viettel: ${e.message}`);
                res.send({ error: e.message });
            });
            request.write(dataRequest);
            request.end();
        } catch (error) {
            res.send({ error });
        }
    });
};