module.exports = app => {
    const http = require('http');

    app.permission.add('fwSms-viettel:send');


    app.sms.sendByViettel = async (phone, mess, emailSent) => await initViettelSms({ phone, mess }, emailSent);


    const initViettelSms = async (body, email) => {
        try {
            let { usernameViettel: user, passViettel: pass, brandName, totalSMSViettel: currentTotal } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);
            let { phone, mess } = body;
            // let user = 'demo_sms',
            //     pass = 'DemoSMS@#123',
            //     brandName = 'MobiService',
            //     phone = '0901303938', //temp
            //     mess = 'Chuc mung sinh nhat quy khach hang'; //temp
            let dataEncode = parseInt(app.sms.checkNonLatinChar(mess));

            const tranId = `${phone}_${new Date().getTime()}`;
            const dataRequest = JSON.stringify({ user, pass, tranId, phone, dataEncode, mess, brandName });
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
                                const item = await app.model.fwSms.create({
                                    email,
                                    sentDate: new Date().getTime(),
                                    total: Math.abs(currentTotal - resData.total)
                                });

                                if (item) {
                                    await app.model.setting.setValue({ totalSMSViettel: resData.total });
                                    resolve({ success: true });
                                } else resolve({ error: 'Create model SMS fail' });
                            } catch (error) {
                                console.error('Request is successfull but callback has error: ', error);
                                resolve({ error: 'Create model SMS fail' });
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
            console.error(error);
        }
    };

    app.post('/api/sms-service/viettel', app.permission.check('fwSms-viettel:send'), async (req, res) => {
        try {
            let email = req.session.user.email, body = req.body;
            const result = await initViettelSms(body, email);
            if (result && result.success) res.send({ success: 'Sent SMS successfully!' });
            else throw (result.error || result);
        } catch (error) {
            res.send({ error });
        }
    });
};