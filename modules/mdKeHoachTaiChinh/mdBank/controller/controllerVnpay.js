module.exports = app => {
    const dateFormat = require('dateformat');
    const querystring = require('qs');
    const crypto = require('crypto');
    // const https = require('https');
    const fs = require('fs');
    function sortObject(obj) {
        let sorted = {};
        let str = [];
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
        }
        return sorted;
    }

    app.get('/api/vnpay/start-thanh-toan', app.permission.check('student:login'), async (req, res) => {
        try {
            const student = req.session.user;
            if (!student || !student.data || !student.data.mssv) throw 'Permission reject!';
            const mssv = student.data.mssv;
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            const { vnp_TmnCode, vnp_HashSecret, vnp_Version, vnp_Command, vnp_CurrCode, vnp_ReturnUrl, hocPhiHocKy: hocKy, hocPhiNamHoc: namHoc, vnpayUrl } = await app.model.tcSetting.getValue('vnp_TmnCode', 'vnp_HashSecret', 'vnp_Version', 'vnp_Command', 'vnp_CurrCode', 'vnp_ReturnUrl', 'hocPhiHocKy', 'hocPhiNamHoc', 'vnpayUrl');

            const dataHocPhi = await app.model.tcHocPhi.get({ mssv, hocKy, namHoc });
            let { congNo } = dataHocPhi;
            const vnp_OrderInfo = `USSH: Học phí SV ${mssv}, học kỳ ${hocKy} NH ${namHoc} - ${parseInt(namHoc) + 1}`;
            const now = new Date(), vnp_CreateDate = dateFormat(now, 'yyyymmddHHmmss'),
                vnp_IpAddr = ipAddr,
                vnp_Locale = 'vn',
                vnp_TxnRef = `${mssv}_${vnp_CreateDate}`;

            const vnp_Amount = congNo * 100;
            let params = { vnp_Version, vnp_Command, vnp_TmnCode, vnp_Locale, vnp_CurrCode, vnp_TxnRef, vnp_OrderInfo, vnp_Amount, vnp_ReturnUrl, vnp_IpAddr, vnp_CreateDate };
            params = sortObject(params);

            const signData = querystring.stringify(params, { encode: false });
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);

            const vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
            params = app.clone(params, { vnp_SecureHash });
            const urlRequest = vnpayUrl + '?' + querystring.stringify(params, { encode: false });
            await app.model.tcHocPhiOrders.create({ hocKy, namHoc, refId: vnp_TxnRef, amount: congNo, bank: 'VNPAY', orderInfo: vnp_OrderInfo });

            res.send(urlRequest);
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    const WHITE_LIST_IP = [
        '113.52.45.78', '116.97.245.130', '42.118.107.252', '113.20.97.250', '203.171.19.146', '103.220.87.4', '113.160.92.202'
    ];

    app.get('/vnpay/ipn', async (req, res) => {
        try {
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            let currentLogs = app.parse(fs.readFileSync(app.path.join(app.assetPath, 'vnpayLog.json')));
            const updateLog = {
                ...currentLogs, [new Date().getTime()]: {
                    'IP VNPAY': ipAddr,
                    'Query': req.query
                }
            };
            fs.writeFileSync(app.path.join(app.assetPath, 'vnpayLog.json'), JSON.stringify(updateLog));

            //TODO: trust ip
            if (!WHITE_LIST_IP.includes(ipAddr)) throw ('Not in trusted IP!');
            let vnp_Params = req.query;
            let secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
            const { vnp_TmnCode, vnp_HashSecret } = await app.model.tcSetting.getValue('vnp_TmnCode', 'vnp_HashSecret', 'vnp_Version', 'vnp_Command', 'vnp_CurrCode');

            let { vnp_Amount, vnp_PayDate, vnp_TransactionNo, vnp_TransactionStatus, vnp_TxnRef } = vnp_Params;
            let mssv = vnp_TxnRef.substring(0, vnp_TxnRef.indexOf('_'));

            if (vnp_TransactionStatus == 99) res.send({ RspCode: '00', Message: 'Confirm Success' });
            vnp_Amount = parseInt(vnp_Amount) / 100;
            const student = await app.model.fwStudents.get({ mssv });
            const order = await app.model.tcHocPhiOrders.get({ refId: vnp_TxnRef });
            if (!student || !order) res.send({ RspCode: '01', Message: 'Order Not Found' });

            if (parseInt(order.amount) != parseInt(vnp_Amount)) res.send({ RspCode: '04', Message: 'Invalid amount' });

            const transaction = await app.model.tcHocPhiTransaction.get({ transId: vnp_TxnRef });
            if (transaction) res.send({ Message: 'Order already confirmed', RspCode: '02' });
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac('sha512', vnp_HashSecret),
                vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

            if (secureHash === vnp_SecureHash) {
                await app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, 'VNPAY', vnp_TxnRef, new Date(vnp_PayDate).getTime(), mssv, vnp_TransactionNo, vnp_TmnCode, vnp_Amount, secureHash);
                res.send({ RspCode: '00', Message: 'Confirm Success' });
            } else {
                res.send({ RspCode: '97', Message: 'Invalid Checksum' });
            }
        }
        catch (error) {
            res.send({ RspCode: '99', Message: 'Node error' });
        }
    });

    app.get('/api/get-query', async (req, res) => {
        const student = req.session.user;
        if (!student || !student.data || !student.data.mssv) throw 'Permission reject!';
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const { vnp_TmnCode, vnp_HashSecret, vnp_Version, vnp_CurrCode, vnp_ReturnUrl, hocPhiHocKy: hocKy, hocPhiNamHoc: namHoc, vnpayQueryUrl } = await app.model.tcSetting.getValue('vnp_TmnCode', 'vnp_HashSecret', 'vnp_Version', 'vnp_CurrCode', 'vnp_ReturnUrl', 'hocPhiHocKy', 'hocPhiNamHoc', 'vnpayQueryUrl');
        const dataOrders = await app.model.tcHocPhiOrders.getAll({ namHoc, hocKy });
        const vnp_Command = 'querydr';

        let params = {
            vnp_IpAddr: ipAddr, vnp_TmnCode, vnp_HashSecret, vnp_Version, vnp_CurrCode, vnp_Command, vnp_ReturnUrl
        };

        dataOrders.forEach(order => {
            params.vnp_TxnRef = order.refId;
            params.vnp_OrderInfo = encodeURIComponent(order.orderInfo);
            params.vnp_CreateDate = dateFormat(new Date(), 'yyyymmddHHmmss');
            params.vnp_TransDate = order.refId.split('_')[1];
            params.vnp_SecureHashType = 'HMACSHA512';
            sortObject(params);

            const signData = querystring.stringify(params, { encode: false });
            const hmac = crypto.createHmac('sha512', vnp_HashSecret);
            params.vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

            console.log(params);
            console.log(vnpayQueryUrl);
            const keys = Object.keys(params);
            let query = '';
            keys.forEach(key => {
                query = query.concat(`${key}=${params[key]}&`);
            });
            console.log(vnpayQueryUrl + '?' + query);
            // https.request(vnpayQueryUrl, (res) => {
            //     console.log(res);
            //     res.on('data', (chunk) => {
            //         console.log(`BODY: ${chunk}`);

            //     });
            // });

        });
        res.send('OK');
    });
};