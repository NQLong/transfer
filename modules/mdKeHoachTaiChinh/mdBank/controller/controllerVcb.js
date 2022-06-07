module.exports = app => {
    const serviceIdVcb = 'EDU';
    const providerIdVcb = 'NVAN';
    const crypto = require('crypto');

    // VCB --------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/VCBPayment/Inquiry', async (req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeVcb: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
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
                        app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
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

    });

    app.post('/api/VCBPayment/Payment', async (req, res) => {
        let { hocPhiNamHoc: namHoc, hocPhiHocKy: hocKy, secretCodeVcb: secretCode } = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'secretCodeVcb');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
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
                        console.log(' - Data = ', dataRequest, '\n - Signature = ', mySignatureRequest);

                        if (mySignatureRequest != signature) {
                            context.status = 'FAILURE';
                            context.errorCode = 18;
                            res.send({ context });
                        } else {
                            const dataResponse = `${channelId}|${channelRefNumber}|${responseMsgId}|${secretCode}`,
                                signature = crypto.createHash('md5').update(dataResponse).digest('hex');
                            app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
                                if (error) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 400;
                                    res.send({ context, signature });
                                } else if (providerId != providerIdVcb || serviceId != serviceIdVcb) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 21;
                                    res.send({ context, signature });
                                } else if (!hocPhi) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 17;
                                    res.send({ context, signature });
                                } else if (hocPhi.congNo <= 0) {
                                    context.status = 'FAILURE';
                                    context.errorCode = 1;
                                    res.send({ context, signature });
                                } else {
                                    const billResult = [];
                                    const solve = (index = 0) => {
                                        if (index == bills.length) {
                                            context.status = 'SUCCESS';
                                            res.send({
                                                context,
                                                payload: {
                                                    providerId, serviceId, bills: billResult
                                                }
                                            });
                                            return;
                                        } else {
                                            let billInfo = bills[index];
                                            if (!(billInfo.billId && billInfo.amount)) {
                                                context.status = 'FAILURE';
                                                context.errorCode = 21;
                                                res.send({ context, signature });
                                                return;
                                            } else {
                                                app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, 'VCB', `VCB-${internalTransactionRefNo}`, new Date(requestDateTime).getTime(), customerCode, billInfo.billId, serviceId, parseInt(billInfo.amount), signature, (error, result) => {
                                                    console.log('Error: ', error);
                                                    console.log('Result: ', result);
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
                                                    solve(index + 1);

                                                });
                                            }
                                        }
                                    };
                                    if (bills && Array.isArray(bills)) solve();
                                    else {
                                        context.status = 'FAILURE';
                                        context.errorCode = 10;
                                        res.send({ context, signature });
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                context.status = 'FAILURE';
                context.errorCode = 400;
                res.send({ context, signature });
            }
        }


    });
};