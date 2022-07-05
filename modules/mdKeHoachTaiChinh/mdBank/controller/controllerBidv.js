module.exports = app => {
    const serviceId = '347002';
    const crypto = require('crypto');
    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    // production
    app.post('/api/bidv-nvxhhcm/getbill', async (req, res) => {
        try {
            await getBill(types.PRODUCTION, req, res);
        } catch (error) {
            console.error('GET BILL BIDV: ', error);
            res.send({ result_code: '096' });
        }
    });

    // sandbox
    app.post('/api/bidv-nvxhhcm/sandbox/getbill', async (req, res) => {
        try {
            await getBill(types.SANDBOX, req, res);
        } catch (error) {
            console.error('GET BILL BIDV: ', error);
            res.send({ result_code: '096' });
        }
    });

    const getBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeBidv', 'secretCodeBidvSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { customer_id, service_id, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');

        if (!(customer_id && service_id && checksum)) {
            res.send({ result_code: '145' });
        }
        else if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const hocPhi = await model.get({ namHoc, hocKy, mssv: customer_id.toString() });
            if (!hocPhi) {
                res.send({ result_code: '001' });
            } else if (hocPhi.congNo <= 0) {
                res.send({ result_code: '025' });
            } else {
                let student = await app.model.fwStudents.get({ mssv: customer_id.toString() });
                if (!student) {
                    res.send({ result_code: '017' });
                } else {
                    let name = `USSH ${student.ho} ${student.ten} ${hocPhi.congNo.toString().numberWithDots()}`.toUpperCase();
                    if (name.length > 40) name = `USSH ${student.ho.getFirstLetters()} ${student.ten} ${hocPhi.congNo.toString().numberWithDots()}`.toUpperCase();
                    res.send({
                        result_code: '000', result_desc: 'success',
                        data: {
                            service_id,
                            customer_id: customer_id.toString(), customer_name: name, customer_addr: '',
                            type: 0, matchAmount: hocPhi.congNo,
                        },
                    });
                }
            }
        }
    };

    // production
    app.post('/api/bidv-nvxhhcm/paybill', async (req, res) => {
        try {
            await payBill(types.PRODUCTION, req, res);
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });

    // sandbox
    app.post('/api/bidv-nvxhhcm/sandbox/paybill', async (req, res) => {
        try {
            await payBill(types.SANDBOX, req, res);
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });

    const payBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeBidv', 'secretCodeBidvSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');

        if (!(trans_id && trans_date && customer_id && bill_id && service_id && amount && checksum)) {
            res.send({ result_code: '145' });
        } else if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            const modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const modelHocPhiTransaction = type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox;
            let hocPhi = await modelHocPhi.get({ namHoc, hocKy, mssv: customer_id });
            if (!hocPhi) {
                res.send({ result_code: '025' });
            } else {
                let student = await app.model.fwStudents.get({ mssv: customer_id });
                await modelHocPhiTransaction.addBill(namHoc, hocKy, 'BIDV', `BIDV-${trans_id}`, app.date.fullFormatToDate(trans_date).getTime(), customer_id, bill_id, service_id, parseInt(amount), checksum);
                type == types.PRODUCTION && await app.model.tcHocPhiTransaction.sendEmailAndSms({ student, hocKy, namHoc, amount: parseInt(amount), trans_date });
                res.send({ result_code: '000', result_desc: 'success' });
            }
        }
    };
};