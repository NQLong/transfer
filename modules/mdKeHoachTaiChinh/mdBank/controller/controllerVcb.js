module.exports = app => {
    const serviceIdVcb = 'EDU';
    const providerIdVcb = 'NVAN';
    const crypto = require('crypto');
    // TODO: Tiến tạo thêm 1 dòng trong TC_Setting: secretCodeVcb = '8FC824A5A94877219ABC9B1B83DA5'

    // VCB --------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/VCBPayment/Inquiry', async (req, res) => {
        let { namHoc, hocKy, secretCodeVcb: secretCode } = await app.model.tcSetting.getValue('namHoc', 'hocKy', 'secretCodeVcb');
        namHoc = Number(namHoc);
        hocKy = Number(hocKy);
        let { context, payload, signature } = req.body,
            { channelId, channelRefNumber } = context,          // contect còn có requestDateTime
            { customerCode, providerId, serviceId } = payload;  // payload còn có fields

        try {
            let data = `${channelId}|${channelRefNumber}|${secretCode}`,
                mySignature = crypto.createHash('md5').update(data).digest('hex');
            // console.log(' - Data = ', data,'\n - Signature = ', mySignature);

            if (mySignature != signature) {
                context.status = 'FAILURE';
                context.errorCode = 18;
                res.send({ context, signature });
            } else {
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
                        app.model.fwStudents.get({ mssv: customerCode }, (error, sinhVien) => {
                            if (error) {
                                context.status = 'FAILURE';
                                context.errorCode = 400;
                                res.send({ context, signature });
                            } else if (!sinhVien) {
                                context.status = 'FAILURE';
                                context.errorCode = 17;
                                res.send({ context, signature });
                            } else {
                                let bills = [
                                    {
                                        billId: customerCode,
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
    });

    // app.post('/api/VCBPayment/Payment', async (req, res) => {
    //     let { namHoc, hocKy, secretCodeVcb: secretCode } = await app.model.tcSetting.getValue('namHoc', 'hocKy', 'secretCodeVcb');
    //     namHoc = Number(namHoc);
    //     hocKy = Number(hocKy);
    //     let { context, payload, signature } = req.body,
    //         { channelId, channelRefNumber, requestDateTime } = context,
    //         { billerDivisionKey, bills, customerCode, providerId, serviceId } = payload;

    //     try {
    //         let data = `${channelId}|${channelRefNumber}|${secretCode}`,
    //             mySignature = crypto.createHash('md5').update(data).digest('hex');
    //         // console.log(' - Data = ', data,'\n - Signature = ', mySignature);

    //         if (mySignature != signature) {
    //             context.status = 'FAILURE';
    //             context.errorCode = 18;
    //             res.send({ context });
    //         } else {
    //             app.model.tcHocPhi.get({ namHoc, hocKy, mssv: customerCode }, (error, hocPhi) => {
    //                 if (error) {
    //                     context.status = 'FAILURE';
    //                     context.errorCode = 400;
    //                     res.send({ context, signature });
    //                 } else if (providerId != providerIdVcb || serviceId != serviceIdVcb) {
    //                     context.status = 'FAILURE';
    //                     context.errorCode = 21;
    //                     res.send({ context, signature });
    //                 } else if (!hocPhi) {
    //                     context.status = 'FAILURE';
    //                     context.errorCode = 17;
    //                     res.send({ context, signature });
    //                 } else if (hocPhi.congNo <= 0) {
    //                     context.status = 'FAILURE';
    //                     context.errorCode = 1;
    //                     res.send({ context, signature });
    //                 } else {
    //                     const billResult = [];
    //                     const solve = (index = 0) => {
    //                         if (index == bills.length) {
    //                             data = `${channelId}|${channelRefNumber}|${'SUCCESS'}|${'0'}|${customerCode}|${totalPaymentAmount}|${paymentMode}|${internalTransactionRefNo}|${JSON.stringify(fields)}|${JSON.stringify(billResult)}|${secretCode}`;
    //                             signature = crypto.createHash('md5').update(data).digest('hex');
    //                             app.model.tcHocPhiTransaction.update({ transId: `VCB-${internalTransactionRefNo}` }, { checksum: signature }, (error, item) => {
    //                                 if (error || !item) {
    //                                     context.status = 'FAILURE';
    //                                     data = `${channelId}|${channelRefNumber}|${'FAILURE'}|${'22'}|${customerCode}|${totalPaymentAmount}|${paymentMode}|${internalTransactionRefNo}|${JSON.stringify(fields)}|${JSON.stringify(billResult)}|${secretCode}`;
    //                                     signature = crypto.createHash('md5').update(data).digest('hex');
    //                                     app.model.tcHocPhiTransaction.update({ transId: `VCB-${internalTransactionRefNo}` }, { checksum: signature, isSuccess: 0 }, () => {
    //                                         res.send({
    //                                             context,
    //                                             payload: { providerId, serviceId, bills: billResult },
    //                                         });
    //                                     });
    //                                 }
    //                             });
    //                         }
    //                         let billInfo = bills[index];
    //                         app.model.tcHocPhiTransaction.addBill(namHoc, hocKy, `VCB-${internalTransactionRefNo}`, new Date(requestDateTime).getTime(), customerCode, billInfo.billId, serviceId, billInfo.amount, '', (error, result) => {
    //                             if (error || !result || !result.outBinds || !result.outBinds.ret) {
    //                                 billResult.push({
    //                                     billId: billInfo.billId,
    //                                     amount: billInfo.amount,
    //                                     billErrorCode: 1,
    //                                 });
    //                             } else {
    //                                 billResult.push({
    //                                     billId: billInfo.billId,
    //                                     amount: billInfo.amount,
    //                                     billErrorCode: 0,
    //                                 });
    //                             }
    //                         });
    //                     };
    //                     solve();
    //                 }
    //             });
    //         }
    //     } catch (error) {
    //         context.status = 'FAILURE';
    //         context.errorCode = 400;
    //         res.send({ context, signature });
    //     }
    // });
};