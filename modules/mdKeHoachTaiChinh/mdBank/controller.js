module.exports = app => {
    const crypto = require('crypto');

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // BIDV
    const urlBidv = '/api/bidv';
    const secretCode = 'BIDV-XHNV';
    const serviceId = 'HocPhi';

    app.post(urlBidv + '/getbill', (req, res) => {
        const { customer_id, service_id, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');
        if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            app.model.tcHocPhi.get({ mssv: customer_id }, (error, hocPhi) => {
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
                                    type: 0, matchAmoun: hocPhi.congNo,
                                },
                            });
                        }
                    });
                }
            });
        }
    });

    app.post(urlBidv + '/paybill', (req, res) => {
        const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');
        if (service_id != serviceId) {
            res.send({ result_code: '020' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007' });
        } else {
            app.model.tcHocPhi.get({ mssv: customer_id }, (error, hocPhi) => {
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
                            // TODO
                            res.send({ trans_date, result_code: '000', result_desc: 'success' });
                        }
                    });
                }
            });
        }
    });
};