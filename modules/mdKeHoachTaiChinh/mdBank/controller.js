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
            let customerName = 'Nguyen Van A',
                matchAmount = 7500000; //TODO
            res.send({
                result_code: '001',
                result_desc: 'success',
                data: {
                    service_id,
                    customer_id,
                    customer_name: customerName,
                    customer_addr: '',
                    type: 0,
                    matchAmount,
                }
            });
        }
    });
};