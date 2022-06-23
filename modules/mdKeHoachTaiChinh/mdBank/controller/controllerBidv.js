module.exports = app => {
    const serviceId = '347002';
    const crypto = require('crypto');
    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };
    // console.log(crypto.createHash('md5').update(`${secretCode}|${serviceId}|2156031059`).digest('hex'));
    // console.log(crypto.createHash('md5').update(`${secretCode}|${1000}|20221000|1500000`).digest('hex'));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    // production
    app.post('/api/bidv-nvxhhcm/getbill', async (req, res) => {
        await getBill(types.PRODUCTION, req, res);
    });

    // sanbox
    app.post('/api/bidv-nvxhhcm/sandbox/getbill', async (req, res) => {
        await getBill(types.SANDBOX, req, res);
    });

    app.post('/api/test-md5', async (req, res) => {
        const { secretCode, trans_id, bill_id, amount } = req.body;
        res.send(crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex'));
    });

    const getBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeBidv', 'secretCodeBidvSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { customer_id, service_id, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');
        console.log('getbill', { customer_id, service_id, checksum });

        if (!(customer_id && service_id && checksum)) {
            res.send({ result_code: '145' });
        }
        else if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            model.get({ namHoc, hocKy, mssv: customer_id }, (error, hocPhi) => {
                if (error) {
                    res.send({ result_code: '096' });
                } else if (!hocPhi || hocPhi.congNo <= 0) {
                    res.send({ result_code: '025' });
                } else {
                    app.model.fwStudents.get({ mssv: customer_id }, (error, sinhVien) => {
                        if (error) {
                            res.send({ result_code: '096' });
                        } else if (!sinhVien) {
                            res.send({ result_code: '017' });
                        } else {
                            res.send({
                                result_code: '000', result_desc: 'success',
                                data: {
                                    service_id,
                                    customer_id, customer_name: (sinhVien.ho + ' ' + sinhVien.ten).toUpperCase(), customer_addr: '',
                                    type: 0, matchAmount: hocPhi.congNo,
                                },
                            });
                        }
                    });
                }
            });
        }
    };

    // production
    app.post('/api/bidv-nvxhhcm/paybill', async (req, res) => {
        try {
            await paybill(types.PRODUCTION, req, res);
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });

    // sandbox
    app.post('/api/bidv-nvxhhcm/sandbox/paybill', async (req, res) => {
        try {
            await paybill(types.SANDBOX, req, res);
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });

    const paybill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeBidv, secretCodeBidvSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeBidv', 'secretCodeBidvSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeBidv : secretCodeBidvSandbox;
        const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');
        console.log('paybill', { namHoc, hocKy, trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum });
        console.log('mychecksum', myChecksum);

        if (!(trans_id && trans_date && customer_id && bill_id && service_id && amount && checksum)) {
            res.send({ result_code: '145' });
        } else if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            const modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const modelHocPhiTransaction = type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox;
            modelHocPhi.get({ namHoc, hocKy, mssv: customer_id }, (error, hocPhi) => {
                if (error) {
                    res.send({ result_code: '096' });
                } else if (!hocPhi) {
                    res.send({ result_code: '025' });
                } else {
                    modelHocPhiTransaction.addBill(namHoc, hocKy, 'BIDV', `BIDV-${trans_id}`, app.date.fullFormatToDate(trans_date).getTime(), customer_id, bill_id, service_id, amount, checksum, (error, result) => {
                        if (error || !result || !result.outBinds || !result.outBinds.ret) {
                            res.send({ result_code: '096' });
                        } else {
                            res.send({ result_code: '000', result_desc: 'success' });
                        }
                    });
                }
            });
        }
    };
};