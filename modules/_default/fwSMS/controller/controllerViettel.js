module.exports = app => {
    const http = require('http');

    app.get('/api/sms-service/viettel', async (res, req) => {
        const { usernameViettel: user, passViettel: pass, brandName: brandname, totalSMSViettel: currentTotal } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);

        let { phone, smsContent } = req.body;

        phone = '0901303938'; //temp
        smsContent = 'Hello, we are HCMUSSH'; //temp

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
                'charser': 'utf8'
            },
            json: dataRequest
        };

        http.request(option, (res) => {
            if (res.statusCode == 1) {
                res.on('data', (data) => {
                    app.model.fwSms.create({
                        email: req.session.user.email,
                        sentDate: new Date().getTime(),
                        total: currentTotal - data.total
                    }, (error, item) => {
                        if (!error || item) app.model.setting.setValue({ totalSMSViettel: data.total }, res.send({ error, item }));
                    });
                });
            }
        });









    });
};