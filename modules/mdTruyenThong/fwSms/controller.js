module.exports = app => {
    const http = require('http');

    app.permission.add('fwSmsViettel:send');
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6021: {
                title: 'SMS',
                link: '/user/sms/send-sms', icon: 'fa-paper-plane', groupIndex: 5
            },
        },
    };

    app.permission.add(
        { name: 'fwSmsViettel:send', menu },
    );

    app.get('/user/sms/send-sms', app.permission.check('fwSmsViettel:send'), app.templates.admin);

    app.permissionHooks.add('staff', 'addTempSms', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && [].includes(staff.email)) {
            app.permissionHooks.pushUserPermission(user, 'fwSmsViettel:send');
            resolve();
        } else resolve();
    }));

    app.sms.sendByViettel = async (phone, mess) => await initViettelSms({ phone, mess });

    const initViettelSms = async (body) => {
        try {
            let { usernameViettel: user, passViettel: pass, brandName, } = await app.model.setting.getValue(['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel']);
            let { phone, mess } = body;
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
                            return resolve({ error: e });
                        }

                        if (resData.code == 1) {
                            try {
                                await app.model.setting.setValue({ totalSMSViettel: resData.total });
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
            console.error(error);
        }
    };

    app.post('/api/sms-service/viettel', app.permission.check('fwSmsViettel:send'), async (req, res) => {
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