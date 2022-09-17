module.exports = app => {
    const serviceId = 'HocPhi';
    const crypto = require('crypto');

    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.post('/api/agri/getbill', async (req, res) => {
        try {
            await getBill(types.PRODUCTION, req, res);
        } catch (error) {
            console.error('GET BILL Agribank: ', error);
            res.send({ result_code: '096', result_desc: 'Lỗi hệ thống' });
        }
    });

    app.post('/api/agri/sandbox/getbill', async (req, res) => {
        try {
            await getBill(types.SANDBOX, req, res);
        } catch (error) {
            console.error('GET BILL Agribank: ', error);
            res.send({ result_code: '096', result_desc: 'Lỗi hệ thống' });
        }
    });

    const getBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeAgri: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeAgri');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const { customer_id, service_id, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${service_id}|${customer_id}`).digest('hex');

        console.log('getbill', { customer_id, service_id, checksum, myChecksum });

        if (!(customer_id && service_id && checksum)) {
            res.send({ result_code: '145', result_desc: 'Lỗi tham số' });
        }
        else if (service_id != serviceId) {
            res.send({ result_code: '020', result_desc: 'Không thuộc service cung cấp' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007', result_desc: 'Checksum không khớp', });
        } else {
            let modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
            const hocPhi = await modelHocPhi.get({ namHoc, hocKy, mssv: customer_id.toString() });
            if (!hocPhi) res.send({ result_code: '025', result_desc: 'Không tìm thấy học phí sinh viên' });
            else if (parseInt(hocPhi.congNo) <= 0) res.send({ result_code: '001', result_desc: 'Sinh viên đã thanh toán đủ học phí', });
            else {
                const student = await app.model.fwStudents.get({ mssv: customer_id.toString() });
                if (!student) res.send({ result_code: '017', result_desc: 'Không tìm thấy sinh viên' });
                else {
                    res.send({
                        result_code: '000', result_desc: 'Thành công',
                        data: {
                            service_id,
                            customer_id, customer_name: (student.ho + ' ' + student.ten).toUpperCase(), customer_addr: '',
                            type: 0, matchAmount: hocPhi.congNo,
                        },
                    });
                }
            }
        }
    };

    app.post('/api/agri/paybill', async (req, res) => {
        try {
            await payBill(types.PRODUCTION, req, res);
        } catch (error) {
            console.error('AGRI PAYBILL error', error);
            res.send({ result_code: '096', result_desc: 'Lỗi hệ thống' });
        }
    });

    app.post('/api/agri/sandbox/paybill', async (req, res) => {
        try {
            await payBill(types.SANDBOX, req, res);
        } catch (error) {
            console.error('AGRI PAYBILL error', error);
            res.send({ result_code: '096', result_desc: 'Lỗi hệ thống' });
        }
    });

    const payBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeAgri: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeAgri');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const { trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum } = req.body,
            myChecksum = crypto.createHash('md5').update(`${secretCode}|${trans_id}|${bill_id}|${amount}`).digest('hex');
        console.log('paybill', { namHoc, hocKy, trans_id, trans_date, customer_id, bill_id, service_id, amount, checksum });

        if (!(trans_id && trans_date && customer_id && bill_id && service_id && amount && checksum)) {
            res.send({ result_code: '145', result_desc: 'Lỗi tham số' });
        } if (service_id != serviceId) {
            res.send({ result_code: '020', result_desc: 'Không thuộc service cung cấp' });
        } else if (checksum != myChecksum) {
            res.send({ result_code: '007', result_desc: 'Checksum không khớp' });
        } else {
            let modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox,
                modelTransaction = type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox;
            const hocPhi = await modelHocPhi.get({ namHoc, hocKy, mssv: customer_id.toString() });
            if (!hocPhi) res.send({ result_code: '025', result_desc: 'Không tìm thấy học phí sinh viên' });
            else if (parseInt(hocPhi.congNo) <= 0) res.send({ result_code: '001', result_desc: 'Sinh viên đã thanh toán đủ học phí' });
            else {
                const student = await app.model.fwStudents.get({ mssv: customer_id.toString() });
                if (!student) res.send({ result_code: '017', result_desc: 'Không tìm thấy sinh viên' });
                else {
                    await modelTransaction.addBill(namHoc, hocKy, 'AGRI', `AGRI-${trans_id}`, app.date.fullFormatToDate(trans_date).getTime(), customer_id, bill_id, service_id, amount, checksum);
                    // type == types.PRODUCTION && await app.model.tcHocPhiTransaction.notify({ student, hocKy, namHoc, amount: parseInt(amount), trans_date });
                    res.send({ result_code: '000', result_desc: 'Thành công' });
                }
            }
        }
    };

};