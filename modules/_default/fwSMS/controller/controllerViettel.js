module.exports = app => {
    const http = require('http');

    app.post('/api/sms-service/viettel', async (req, res) => {
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
            const option = {
                host: '125.212.226.79',
                port: 9020,
                path: '/service/zalo_api',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // json: dataRequest
            };

            const request = http.request(option, (res) => {
                console.log('Status: ' + res.statusCode);
                console.log('Headers: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                    if (chunk.code == 1) {
                        app.model.fwSms.create({
                            email: req.session.user.email,
                            sentDate: new Date().getTime(),
                            total: Math.abs(currentTotal - chunk.total)
                        }, (error, item) => {
                            if (!error || item) app.model.setting.setValue({ totalSMSViettel: chunk.total }, () => res.send({ item }));
                            else res.send({ error });
                        });
                    } else res.send({ error: 'Unsuccessful request' });
                });
                res.on('end', () => {
                    console.log('No more data in response.');
                });
                // if (res.statusCode == 200) {
                //     res.on('data', (data) => {
                // if (data.code == 1) {
                //     app.model.fwSms.create({
                //         email: req.session.user.email,
                //         sentDate: new Date().getTime(),
                //         total: Math.abs(currentTotal - data.total)
                //     }, (error, item) => {
                //         if (!error || item) app.model.setting.setValue({ totalSMSViettel: data.total }, () => res.send({ item }));
                //         else res.send({ error });
                //     });
                // } else res.send({ error: 'Unsuccessful request' });
                //     });
                // } else res.send({ error: 'Requesting to Viettel has been failed' });
            });
            request.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                res.send({ error: e.message });
            });
            request.write(JSON.stringify(dataRequest));
            request.end();
        } catch (error) {
            res.send({ error });
        }

    });
};