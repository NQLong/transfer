module.exports = app => {
    const serviceId = 'HocPhi';
    const crypto = require('crypto');

    // VCB --------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/PayLoad/Inquiry', async (req, res) => {
        try {
            // console.log('Get in success');

            let { namHoc, hocKy } = await app.model.tcSetting.getValue('namHoc', 'hocKy');
            namHoc = Number(namHoc);
            hocKy = Number(hocKy);

            const secretCode = '8FC824A5A94877219ABC9B1B83DA5'; //TODO: Lấy từ settings
            const providerId = 'VCB_XHNV';

            // console.log('body:', req.body);
            let { context, payload } = req.body,
                { channelId, channelRefNumber } = context,
                { customerCode, fields, signature } = payload;

            let data = `${channelId}|${channelRefNumber}|${providerId}|${serviceId}|${customerCode}|${JSON.stringify(fields)}|${secretCode}`;
            let mySignature = crypto.createHash('md5').update(data).digest('hex');

            // console.log('data = ', data);
            // console.log('signature = ', mySignature);

            if (mySignature != signature) {
                context.status = 'Failure';
                context.errorCode = 18;
                res.send({ context });
            }
            else app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
                if (error) {
                    context.status = 'Failure';
                    context.errorCode = 400;
                    res.send({ context });
                }
                else if (!hocPhi) {
                    context.status = 'Failure';
                    context.errorCode = 10;
                    res.send({ context });
                } else if (hocPhi.congNo <= 0) {
                    context.status = 'Failure';
                    context.errorCode = 1;
                    res.send({ context });
                } else {
                    app.model.fwStudents.get({ mssv: customerCode }, (error, sinhVien) => {
                        if (error) {
                            context.status = 'Failure';
                            context.errorCode = 400;
                            res.send({ context });
                        }
                        else if (!sinhVien) {
                            context.status = 'Failure';
                            context.errorCode = 17;
                            res.send({ context });
                        } else {
                            let bills = [
                                {
                                    billId: '1',
                                    amount: hocPhi.congNo.toString(),
                                    billDate: hocPhi.billDate,
                                    billDueDate: hocPhi.billDueDate,
                                    mySignature
                                }
                            ], customerName = (sinhVien.ho + ' ' + sinhVien.ten).trim().toUpperCase();
                            context.status = 'Success';
                            data = `${channelId}
                        |${channelRefNumber}
                        |${context.status}
                        |${context.errorCode}
                        |${context.billerDivisionKey || ''}
                        |${customerCode}
                        |${customerName}
                        |${''}
                        |${''}
                        |${JSON.stringify(bills)}
                        |${secretCode}`;
                            signature = crypto.createHash('md5').update(data).digest('hex');
                            res.send({
                                context,
                                payload: {
                                    customerCode, customerName, bills, signature
                                }
                            });
                        }
                    });
                }

            });
        }
        catch (error) {
            res.sendStatus(400);
        }

    });

    app.post('/api/PayLoad/Payment', async (req, res) => {
        try {
            let { namHoc, hocKy } = await app.model.tcSetting.getValue('namHoc', 'hocKy');
            namHoc = Number(namHoc);
            hocKy = Number(hocKy);
            const secretCode = '8FC824A5A94877219ABC9B1B83DA5'; //TODO: Lấy từ settings
            const providerId = 'VCB_XHNV';
            let { context, payload } = req.body,
                { channelId, channelRefNumber, requestDateTime } = context,
                { customerCode, fields, signature, totalPaymentAmount, paymentMode, internalTransactionRefNo, bills } = payload;

            let data = `${channelId}
            |${channelRefNumber}
            |${providerId}
            |${serviceId}
            |${customerCode}
            |${totalPaymentAmount}
            |${paymentMode}
            |${internalTransactionRefNo}
            |${JSON.stringify(fields)}
            |${JSON.stringify(bills)}
            |${secretCode}`;

            let mySignature = crypto.createHash('md5').update(data).digest('hex');

            if (mySignature != signature) {
                context.status = 'Failure';
                context.errorCode = 18;
                res.send({ context });
            }
            else app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
                if (error) {
                    context.status = 'Failure';
                    context.errorCode = 400;
                    res.send({ context });
                }
                else if (!hocPhi) {
                    context.status = 'Failure';
                    context.errorCode = 10;
                    res.send({ context });
                } else if (hocPhi.congNo <= 0) {
                    context.status = 'Failure';
                    context.errorCode = 1;
                    res.send({ context });
                } else {
                    const billResult = [];
                    const solve = (index = 0) => {
                        if (index == bills.length) {
                            data = `${channelId}
                                |${channelRefNumber}
                                |${'Success'}
                                |${'0'}
                                |${customerCode}
                                |${totalPaymentAmount}
                                |${paymentMode}
                                |${internalTransactionRefNo}
                                |${JSON.stringify(fields)}
                                |${JSON.stringify(billResult)}
                                |${secretCode}`;
                            signature = crypto.createHash('md5').update(data).digest('hex');
                            app.model.tcHocPhiTransaction.update({ transId: `VCB-${internalTransactionRefNo}` }, { checksum: signature }, (error, item) => {
                                if (error || !item) {
                                    context.status = 'Failure';
                                    data = `${channelId}
                                        |${channelRefNumber}
                                        |${'Failure'}
                                        |${'22'}
                                        |${customerCode}
                                        |${totalPaymentAmount}
                                        |${paymentMode}
                                        |${internalTransactionRefNo}
                                        |${JSON.stringify(fields)}
                                        |${JSON.stringify(billResult)}
                                        |${secretCode}`;
                                    signature = crypto.createHash('md5').update(data).digest('hex');
                                    app.model.tcHocPhiTransaction.update({ transId: `VCB-${internalTransactionRefNo}` }, { checksum: signature, isSuccess: 0 }, () => {
                                        res.send({
                                            context,
                                            payload: {
                                                providerId, serviceId, bills: billResult
                                            }
                                        });
                                    });
                                }
                            });
                        }
                        let billInfo = bills[index];
                        app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, `VCB-${internalTransactionRefNo}`, new Date(requestDateTime).getTime(), customerCode, billInfo.billId, serviceId, billInfo.amount, '', (error, result) => {
                            if (error || !result || !result.outBinds || !result.outBinds.ret) {
                                billResult.push({
                                    billId: billInfo.billId,
                                    amount: billInfo.amount,
                                    billErrorCode: 1,
                                });
                            } else {
                                billResult.push({
                                    billId: billInfo.billId,
                                    amount: billInfo.amount,
                                    billErrorCode: 0,
                                });
                            }
                        });
                    };
                    solve();
                }
            });
        } catch (error) {
            res.send({ result_code: '096' });
        }
    });
};