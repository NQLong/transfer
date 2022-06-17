module.exports = app => {
    const http = require('http');

    app.post('/api/sms-service/viettel', async (res, req) => {
        try {
            let { usernameViettel: user, passViettel: pass, brandName: brandname, totalSMSViettel: currentTotal } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);

            let { phone, smsContent } = req.body;

            // let user = 'demo_sms',
            //     pass = 'DemoSMS@#123',
            //     brandname = 'MobiService',
            //     phone = '0901303938', //temp
            //     smsContent = 'Chuc mung sinh nhat quy khach hang'; //temp

            const tranId = `${phone}_${new Date().getTime()}`;
            const dataRequest = {
                user, pass, tranId, phone, dataEncode: 1, smsContent, brandname
            };
            console.log('REQUEST = ', dataRequest);
            const option = {
                host: '125.212.226.79',
                port: 9020,
                path: 'service/zalo_api',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'charser': 'utf8'
                },
                json: dataRequest
            };

            http.request(option, (res) => {
                console.log('Response: ', res);
                if (res.statusCode == 200) {
                    res.on('data', (data) => {
                        if (data.code == 1) {
                            app.model.fwSms.create({
                                email: req.session.user.email,
                                sentDate: new Date().getTime(),
                                total: Math.abs(currentTotal - data.total)
                            }, (error, item) => {
                                if (!error || item) app.model.setting.setValue({ totalSMSViettel: data.total }, () => res.send({ item }));
                                else res.send({ error });
                            });
                        } else res.send({ error: 'Unsuccessful request' });
                    });
                } else res.send({ error: 'Requesting to Viettel has been failed' });
            });
        } catch (error) {
            res.send({ error });
        }

    });
};