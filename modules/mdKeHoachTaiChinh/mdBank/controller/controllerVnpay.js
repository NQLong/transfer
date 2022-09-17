module.exports = app => {
    const dateFormat = require('dateformat');
    const querystring = require('qs');
    const crypto = require('crypto');

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

    app.get('/vnpay/ipn', async (req, res) => {
        try {
            let vnp_Params = req.query;
            let secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
            const { vnp_TmnCodeAgribank, vnp_TmnCodeVnpayAgribank, vnp_HashSecretAgribank, vnp_TmnCodeVcb, vnp_TmnCodeVnpayVcb, vnp_HashSecretVcb, } = await app.model.tcSetting.getValue('vnp_TmnCodeAgribank', 'vnp_TmnCodeVnpayAgribank', 'vnp_HashSecretAgribank', 'vnp_TmnCodeVcb', 'vnp_TmnCodeVnpayVcb', 'vnp_HashSecretVcb');
            const hashMapper = {
                'HCMUSSH1': vnp_HashSecretAgribank,
                'HCMUSSH2': vnp_HashSecretAgribank,
                'VCBXHNV2': vnp_HashSecretVcb,
                'VCBXHNV1': vnp_HashSecretVcb
            };
            let { vnp_Amount, vnp_PayDate, vnp_BankCode, vnp_TransactionNo, vnp_TransactionStatus, vnp_TxnRef, vnp_TmnCode } = vnp_Params;
            let mssv = vnp_TxnRef.substring(0, vnp_TxnRef.indexOf('_'));
            const vnp_HashSecret = hashMapper[vnp_TmnCode];
            if (![vnp_TmnCodeAgribank, vnp_TmnCodeVnpayAgribank, vnp_TmnCodeVcb, vnp_TmnCodeVnpayVcb].includes(vnp_TmnCode)) res.send({ RspCode: '99', Message: 'Merchant Code Has Been Changed' });
            else if (vnp_TransactionStatus == 99) res.send({ RspCode: '00', Message: 'Confirm Success' });
            else {
                vnp_Amount = parseInt(parseInt(vnp_Amount) / 100);
                const student = await app.model.fwStudents.get({ mssv });
                const order = await app.model.tcHocPhiOrders.get({ refId: vnp_TxnRef });
                if (!student || !order) return res.send({ RspCode: '01', Message: 'Order Not Found' });

                //Invalid Amount
                if (parseInt(order.amount) != vnp_Amount) res.send({ RspCode: '04', Message: 'Invalid amount' });
                else {
                    const signData = querystring.stringify(vnp_Params, { encode: false });
                    const hmac = crypto.createHmac('sha512', vnp_HashSecret),
                        vnp_SecureHash = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

                    if (secureHash === vnp_SecureHash) {
                        const transaction = await app.model.tcHocPhiTransaction.get({ transId: vnp_TxnRef });

                        // Order already confirmed
                        if (transaction) res.send({ Message: 'Order already confirmed', RspCode: '02' });
                        else if (vnp_TransactionStatus == '00') {
                            await app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, `VNPAY_${vnp_BankCode}`, vnp_TxnRef, app.date.fullFormatToDate(vnp_PayDate).getTime(), mssv, vnp_TransactionNo, vnp_TmnCode, vnp_Amount, secureHash);
                            res.send({ RspCode: '00', Message: 'Confirm Success' });

                            app.model.tcHocPhiTransaction.sendEmailAndSms({ student, hocKy, namHoc, amount: vnp_Amount, payDate: vnp_PayDate.toString() });

                        } else {
                            res.send({ RspCode: vnp_TransactionStatus, Message: 'Confirm Fail' });
                        }
                    } else {
                        res.send({ RspCode: '97', Message: 'Invalid Checksum' });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error catch VNPAY: ', error);
            res.send({ RspCode: '99', Message: 'Unknow error' });
        }
    });

    app.get('/api/get-query', async (req, res) => {
        const student = req.session.user;
        if (!student || !student.data || !student.data.mssv) throw 'Permission reject!';
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const { vnp_TmnCode, vnp_HashSecret, vnp_Version, vnp_CurrCode, vnp_ReturnUrl, hocPhiHocKy: hocKy, hocPhiNamHoc: namHoc } = await app.model.tcSetting.getValue('vnp_TmnCode', 'vnp_HashSecret', 'vnp_Version', 'vnp_CurrCode', 'vnp_ReturnUrl', 'hocPhiHocKy', 'hocPhiNamHoc', 'vnpayQueryUrl');
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

            const keys = Object.keys(params);
            let query = '';
            keys.forEach(key => {
                query = query.concat(`${key}=${params[key]}&`);
            });
        });
        res.send('OK');
    });
};