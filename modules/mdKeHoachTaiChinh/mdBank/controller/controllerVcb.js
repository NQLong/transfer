module.exports = app => {
    const serviceIdVcb = 'EDU';
    const providerIdVcb = 'NVAN';
    // const dateFormat = require('dateformat');

    const crypto = require('crypto');
    const types = {
        SANDBOX: 'sandbox',
        PRODUCTION: 'production'
    };

    // VCB --------------------------------------------------------------------------------------------------------------------------------------
    // production
    app.post('/api/VCBPayment/Inquiry', async (req, res) => {
        await getBill(types.PRODUCTION, req, res);
    });

    // sandbox
    app.post('/api/VCBPayment/Sandbox/Inquiry', async (req, res) => {
        await getBill(types.SANDBOX, req, res);
    });

    const getBill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeVcb, secretCodeVcbSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb', 'secretCodeVcbSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeVcb : secretCodeVcbSandbox;
        let { context, payload, signature } = req.body;
        if (!(context && payload)) {
            res.sendStatus(400);
        } else {
            let { channelId, channelRefNumber, responseMsgId, requestDateTime } = context,  // Nếu thiếu báo lỗi thiếu params
                { customerCode, providerId, serviceId } = payload;
            if (!(channelId && channelRefNumber && requestDateTime && providerId && serviceId && customerCode)) {
                context.status = 'FAILURE';
                context.errorCode = 10;
                res.send({ context, signature });
            } else {
                try {
                    let time = new Date(requestDateTime).getTime();
                    if (isNaN(time)) {
                        context.status = 'FAILURE';
                        context.errorCode = 20;
                        res.send({ context, signature });
                    }

                    const dataRequest = `${channelId}|${channelRefNumber}|${secretCode}`,
                        mySignatureRequest = crypto.createHash('md5').update(dataRequest).digest('hex');
                    // console.log(' - Data = ', dataRequest, '\n - My Signature = ', mySignatureRequest, '\n - Signature = ', signature);

                    const dataResponse = `${channelId}|${channelRefNumber}|${responseMsgId}|${secretCode}`,
                        signatureResponse = crypto.createHash('md5').update(dataResponse).digest('hex');

                    if (!signature || mySignatureRequest != signature) {
                        context.status = 'FAILURE';
                        context.errorCode = 18;
                        res.send({ context, signature: signatureResponse });
                    } else {
                        const model = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;

                        model.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
                            if (error) {
                                context.status = 'FAILURE';
                                context.errorCode = 400;
                                res.send({ context, signature: signatureResponse });
                            } else if (providerId != providerIdVcb || serviceId != serviceIdVcb) {
                                context.status = 'FAILURE';
                                context.errorCode = 21;
                                res.send({ context, signature: signatureResponse });
                            } else if (!hocPhi) {
                                context.status = 'FAILURE';
                                context.errorCode = 17;
                                res.send({ context, signature: signatureResponse });
                            } else if (hocPhi.congNo <= 0) {
                                context.status = 'FAILURE';
                                context.errorCode = 1;
                                res.send({ context, signature: signatureResponse });
                            } else {
                                app.model.fwStudents.get({ mssv: customerCode }, (error, sinhVien) => {
                                    if (error) {
                                        context.status = 'FAILURE';
                                        context.errorCode = 400;
                                        res.send({ context, signature: signatureResponse });
                                    } else if (!sinhVien) {
                                        context.status = 'FAILURE';
                                        context.errorCode = 17;
                                        res.send({ context, signature: signatureResponse });
                                    } else {
                                        let bills = [
                                            {
                                                billId: `${customerCode}.${namHoc}.${hocKy}`,
                                                amount: hocPhi.congNo.toString(),
                                            }
                                        ];
                                        context.status = 'SUCCESS';
                                        context.errorCode = 0;

                                        res.send({
                                            context,
                                            payload: { bills, customerCode, paymentSequence: 1 },
                                            signature,
                                        });
                                    }
                                });
                            }
                        });
                    }
                } catch (error) {
                    context.status = 'FAILURE';
                    context.errorCode = 400;
                    res.send({ context, signature });
                }
            }
        }

    };

    // production
    app.post('/api/VCBPayment/Payment', async (req, res) => {
        await paybill(types.PRODUCTION, req, res);
    });

    // sandbox
    app.post('/api/VCBPayment/Sandbox/Payment', async (req, res) => {
        await paybill(types.SANDBOX, req, res);
    });

    const paybill = async (type, req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeVcb, secretCodeVcbSandbox } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb', 'secretCodeVcbSandbox');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        const secretCode = type === types.PRODUCTION ? secretCodeVcb : secretCodeVcbSandbox;
        let { context, payload, signature } = req.body;
        if (!(context && payload)) {
            res.sendStatus(400);
        } else {
            let { channelId, channelRefNumber, requestDateTime, responseMsgId } = context,
                { bills, customerCode, providerId, serviceId, internalTransactionRefNo, totalPaymentAmount, paymentMode } = payload;
            try {
                if (!(channelId && channelRefNumber && requestDateTime && providerId && serviceId && customerCode && totalPaymentAmount && paymentMode && ['A', 'C', 'D'].includes(paymentMode) && internalTransactionRefNo)) {
                    context.status = 'FAILURE';
                    context.errorCode = 10;
                    res.send({ context, signature });
                } else if (requestDateTime) {
                    let time = new Date(requestDateTime).getTime();
                    if (isNaN(time)) {
                        context.status = 'FAILURE';
                        context.errorCode = 20;
                        res.send({ context, signature });
                    } else {
                        const dataRequest = `${channelId}|${channelRefNumber}|${secretCode}`,
                            mySignatureRequest = crypto.createHash('md5').update(dataRequest).digest('hex');

                        if (mySignatureRequest != signature) {
                            context.status = 'FAILURE';
                            context.errorCode = 18;
                            res.send({ context });
                        } else {
                            const modelHocPhi = type === types.PRODUCTION ? app.model.tcHocPhi : app.model.tcHocPhiSandbox;
                            const modelHocPhiTransaction = type === types.PRODUCTION ? app.model.tcHocPhiTransaction : app.model.tcHocPhiTransactionSandbox;
                            const dataResponse = `${channelId}|${channelRefNumber}|${responseMsgId}|${secretCode}`,
                                signature = crypto.createHash('md5').update(dataResponse).digest('hex');
                            if (providerId != providerIdVcb || serviceId != serviceIdVcb) {
                                context.status = 'FAILURE';
                                context.errorCode = 21;
                                res.send({ context, signature });
                            } else {
                                const hocPhi = modelHocPhi.get({ namHoc, hocKy, mssv: customerCode });
                                // student = app.model.fwStudents.get({ mssv: customerCode });
                                if (!hocPhi) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 17;
                                    res.send({ context, signature });
                                } else if (hocPhi.congNo <= 0) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 1;
                                    res.send({ context, signature });
                                } else {
                                    const billResult = [];
                                    for (const billInfo of bills) {
                                        if (!(billInfo.billId && billInfo.amount)) {
                                            context.status = 'FAILURE';
                                            context.errorCode = 21;
                                            return res.send({ context, signature });
                                        } else {
                                            try {
                                                let transaction = modelHocPhiTransaction.addBill(namHoc, hocKy, 'VCB', `VCB-${internalTransactionRefNo}`, new Date(requestDateTime).getTime(), customerCode, billInfo.billId, serviceId, parseInt(billInfo.amount), signature);
                                                if (!transaction || !transaction.outBinds || !transaction.outBinds.ret) throw 'Add bill failed';
                                                else {
                                                    billResult.push({
                                                        billId: billInfo.billId,
                                                        amount: billInfo.amount,
                                                        billErrorCode: 0,
                                                    });
                                                }
                                            } catch (error) {
                                                console.error('VCB add transaction: ', error);
                                                billResult.push({
                                                    billId: billInfo.billId,
                                                    amount: billInfo.amount,
                                                    billErrorCode: 1,
                                                });
                                            }
                                        }
                                    }
                                    context.status = 'SUCCESS';
                                    if (!billResult.length) {
                                        // type == types.PRODUCTION && await app.model.tcHocPhiTransaction.sendEmailAndSms({ student, hocKy, namHoc, amount: totalPaymentAmount, payDate: dateFormat(new Date(requestDateTime, 'yyyymmddHHmmss')) });
                                    }
                                    return res.send({
                                        context,
                                        payload: {
                                            providerId, serviceId, bills: billResult
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                context.status = 'FAILURE';
                context.errorCode = 400;
                res.send({ context, signature });
            }
        }
    };
};