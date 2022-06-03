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
            res.send({ error: 'Invalid service!' });
        } else if (checksum != myChecksum) {
            res.send({ error: 'Invalid checksum!' });
        } else {
            app.model.tcHocPhi.get({ mssv: customer_id }, (error, hocPhi) => {
                if (error) {
                    res.send({ error: 'HCMUSSH System has errors!' });
                } else if (!hocPhi) {
                    res.send({ error: 'The student\'s fee is not available!' });
                } else {
                    app.model.fwStudents.get({ mssv: customer_id }, (error, sinhVien) => {
                        if (error) {
                            res.send({ error: 'HCMUSSH System has errors!' });
                        } else if (!sinhVien) {
                            res.send({ error: 'The student is not available!' });
                        } else {
                            res.send({
                                result_code: '001',
                                result_desc: 'success',
                                data: {
                                    service_id, customer_id, type: 0,
                                    customer_name: (sinhVien.ho + ' ' + sinhVien.ten).toUpperCase(), customer_addr: '',
                                    matchAmoun: hocPhi.congNo,
                                },
                            });
                        }
                    });
                }
            });
        }
    });
};