module.exports = app => {
    const serviceId = 'HocPhi';
    const crypto = require('crypto');
    // console.log(crypto.createHash('md5').update(`${SecretCode}|${serviceId}|2156031059`).digest('hex'));
    // console.log(crypto.createHash('md5').update(`${SecretCode}|${1000}|20221000|1500000`).digest('hex'));

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/agri/getbill', async (req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeAgri: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeAgri');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const { customer_id, service_id, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');
        console.log('getbill', { customer_id, service_id, checksum });

        if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customer_id }, (error, hocPhi) => {
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
    });

    app.post('/api/agri/paybill', async (req, res) => {
        try {
            let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeAgri: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeAgri');
            namHoc = Number(namHoc);
            hocKy = Number(hocKy);
            const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
                myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');
            console.log('paybill', { namHoc, hocKy, trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum });

            if (service_id != serviceId) {
                res.send({ result_code: '020' });
            } else if (checksum != myChecksum) {
                res.send({ result_code: '007' });
            } else {
                app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customer_id }, (error, hocPhi) => {
                    if (error) {
                        res.send({ result_code: '096' });
                    } else if (!hocPhi) {
                        res.send({ result_code: '025' });
                    } else {
                        app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, 'AGRI', `AGRI-${trans_id}`, trans_date, customer_id, bill_id, service_id, amount, checksum, (error, result) => {
                            if (error || !result || !result.outBinds || !result.outBinds.ret) {
                                res.send({ result_code: '096' });
                            } else {
                                res.send({ result_code: '000', result_desc: 'success' });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });
};