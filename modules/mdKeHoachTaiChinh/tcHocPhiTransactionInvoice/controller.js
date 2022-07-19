module.exports = app => {
    const request = require('request');

    app.permission.add('tcInvoice:read', 'tcInvoice:write', 'tcInvoice:delete');

    const baseURL = 'https://testapi.meinvoice.vn/api/v3/';

    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview'
    }
    const axios = require('axios');


    const getMisaToken = async () => {
        try {

            const response = await app.getMisaAxiosInstance().post(url.login, {
                "appid": "f8a619af-0418-11ed-b268-005056b219fb",
                "taxcode": "0101243150-382",
                "username": "testmisa@yahoo.com",
                "password": "123456Aa"
            });
            return response.Data;
        } catch (error) {
            return null;
        }


    }

    app.getMisaAxiosInstance = (errorHandler = true) => {

        const axiosInstance = axios.create({
            baseURL: baseURL,
            timeout: 100000,
            headers: {
                Authorization: 'Bearer ' + app.misaInvoiceAccessToken,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });

        axiosInstance.interceptors.response.use(async (response) => {
            const data = response.data;
            // console.log({ data });
            if (!data.Success) {
                const originalRequest = response.config;
                if (originalRequest.url.endsWith(url.login)) {
                    console.error('MisaInvoice: Đăng nhập thất bại', data.ErrorCode, data.Errors);
                    return Promise.reject('MisaInvoice: Đăng nhập thất bại');
                } else if (errorHandler) {
                    if (['InvalidTokenCode', 'TokenExpiredCode'].includes(data.ErrorCode)) {
                        const newToken = await getMisaToken();
                        if (newToken) {
                            app.misaInvoiceAccessToken = newToken;
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return app.getMisaAxiosInstance(false)(originalRequest);
                        }
                    }
                }
                return Promise.reject(response.data);
            }
            return response.data

        }, async (error) => {
            console.error('MisaInvoice: error');
            return Promise.reject(error);
        });
        return axiosInstance;
    }
    app.misaInvoiceAccessToken = 'Bearer Token';

    // const compileInvoice = (transaction, sinhVien, other) => {
    //     const refID = app.isDebug ? new Date().getTime().toString() : transaction.transactionId
    //     return {
    //         "RefID": refID,
    //         "OriginalInvoiceData": {
    //             "RefID": refID,
    //             "InvSeries": "2C22TCH",
    //             "InvoiceName": "Hóa đơn thu học phí",
    //             "InvDate": app.toIsoString(new Date()),
    //             "CurrencyCode": "VND",
    //             "ExchangeRate": 1.0,
    //             "PaymentMethodName": "TM/CK",
    //             "IsInvoiceSummary": false,
    //             "SellerTaxCode": "0101243150-382",
    //             //MSSV
    //             "Customfield1": sinhVien.mssv,
    //             //Khóa lớp
    //             "Customfield2": sinhVien.loaiHinhDaoTao.ten,
    //             //Hệ
    //             "Customfield3": sinhVien.khoa.ten,
    //             // "SellerAddress": "Tầng X, Tòa nhà Y, Số zzz Cầu Giấy - Hà Nội",
    //             // "BuyerLegalName": "Công ty cổ phần MISA (Test - 666)",
    //             // "BuyerTaxCode": "0101243150-666",
    //             "BuyerFullName": `${sinhVien.ho} ${sinhVien.ten}`.trim().toUpperCase(),
    //             // "BuyerAddress": "",
    //             "BuyerEmail": sinhVien.emailTruong,
    //             "ContactName": null,
    //             "DiscountRate": null,
    //             "TotalAmountWithoutVATOC": null,
    //             // "TotalVATAmountOC": 15000.0,
    //             "TotalDiscountAmountOC": null,
    //             "TotalAmountOC": transaction.amount,
    //             "TotalAmountInWords": app.numberToVnText(`${transaction.amount}`) + " đồng.",
    //             "OriginalInvoiceDetail": [
    //                 {
    //                     "ItemType": 1,
    //                     "LineNumber": 1,
    //                     "SortOrder": 1,
    //                     "ItemCode": "HOC-PHI",
    //                     "ItemName": "Tạm thu học phí HK01 - 2022",
    //                     // "UnitName": null,
    //                     // "Quantity": 1.0,
    //                     // "UnitPrice": 150000.0,
    //                     "DiscountRate": null,
    //                     "DiscountAmountOC": null,
    //                     "DiscountAmount": null,
    //                     "AmountOC": transaction.amount,
    //                     "Amount": transaction.amount,
    //                     // "VATRateName": "10%",
    //                     // "VATAmountOC": 15000.0,
    //                     // "VATAmount": 15000.0
    //                 }
    //             ],
    //             "TaxRateInfo": [
    //                 // {
    //                 //     // "VATRateName": "10%",
    //                 //     // "AmountWithoutVATOC": 150000.0,
    //                 //     // "VATAmountOC": 15000.0
    //                 // }
    //             ],
    //             "FeeInfo": null,
    //             // "OptionUserDefined": {
    //             //     "MainCurrency": "VND",
    //             //     "AmountDecimalDigits": "2",
    //             //     "AmountOCDecimalDigits": "2",
    //             //     "UnitPriceOCDecimalDigits": "2",
    //             //     "UnitPriceDecimalDigits": "2",
    //             //     "QuantityDecimalDigits": "3",
    //             //     "CoefficientDecimalDigits": "2",
    //             //     "ExchangRateDecimalDigits": "2",
    //             //     "ClockDecimalDigits": "4"
    //             // },
    //             "TotalAmount": transaction.amount,
    //             "TotalAmountWithoutVAT": null,
    //             "TotalVATAmount": null,
    //             "TotalDiscountAmount": null,
    //             "TotalSaleAmountOC": null,
    //             "TotalSaleAmount": null,
    //             "IsTaxReduction43": null,
    //             "IsTaxReduction": null,
    //             "TotalAmountInWordsVN": null,
    //             "TotalAmountInWordsUnsignNormalVN": null
    //         }
    //     }
    // };
    const compileInvoice = (hocPhi, transactions) => {
        const invoiceDate = new Date(),
            refID = `${hocPhi.mssv}-${hocPhi.namHoc}-${hocPhi.hocKy}-${invoiceDate.getTime()}`,
            totalAmountOC = transactions.reduce((partialSum, transaction) => partialSum + transaction.amount, 0);
        return {
            "RefID": refID,
            "OriginalInvoiceData": {
                "RefID": refID,
                "InvSeries": "2C22TCH",
                "InvoiceName": "Hóa đơn thu học phí",
                "InvDate": app.toIsoString(invoiceDate),
                "CurrencyCode": "VND",
                "ExchangeRate": 1.0,
                "PaymentMethodName": "TM/CK",
                "IsInvoiceSummary": false,
                "SellerTaxCode": "0101243150-382",
                //MSSV
                "Customfield1": hocPhi.mssv,
                //Khóa lớp
                "Customfield2": hocPhi.tenLoaiHinhDaoTao,
                //Hệ
                "Customfield3": hocPhi.tenKhoa,
                // "SellerAddress": "Tầng X, Tòa nhà Y, Số zzz Cầu Giấy - Hà Nội",
                // "BuyerLegalName": "Công ty cổ phần MISA (Test - 666)",
                // "BuyerTaxCode": "0101243150-666",
                "BuyerFullName": `${hocPhi.ho} ${hocPhi.ten}`.trim().toUpperCase(),
                // "BuyerAddress": "",
                "BuyerEmail": hocPhi.email,
                "ContactName": null,
                "DiscountRate": null,
                "TotalAmountWithoutVATOC": null,
                // "TotalVATAmountOC": 15000.0,
                "TotalDiscountAmountOC": null,
                "TotalAmountOC": totalAmountOC,
                "TotalAmountInWords": app.numberToVnText(`${totalAmountOC}`) + " đồng.",
                "OriginalInvoiceDetail": transactions.map((transaction, index) => {
                    return {
                        "ItemType": 1,
                        "LineNumber": index + 1,
                        "SortOrder": index + 1,
                        "ItemCode": "HOC-PHI",
                        "ItemName": hocPhi.loaiPhi,
                        // "UnitName": null,
                        // "Quantity": 1.0,
                        // "UnitPrice": 150000.0,
                        "DiscountRate": null,
                        "DiscountAmountOC": null,
                        "DiscountAmount": null,
                        "AmountOC": transaction.amount,
                        "Amount": transaction.amount,
                        // "VATRateName": "10%",
                        // "VATAmountOC": 15000.0,
                        // "VATAmount": 15000.0
                    };
                }),
                "TaxRateInfo": [
                    // {
                    //     // "VATRateName": "10%",
                    //     // "AmountWithoutVATOC": 150000.0,
                    //     // "VATAmountOC": 15000.0
                    // }
                ],
                "FeeInfo": null,
                // "OptionUserDefined": {
                //     "MainCurrency": "VND",
                //     "AmountDecimalDigits": "2",
                //     "AmountOCDecimalDigits": "2",
                //     "UnitPriceOCDecimalDigits": "2",
                //     "UnitPriceDecimalDigits": "2",
                //     "QuantityDecimalDigits": "3",
                //     "CoefficientDecimalDigits": "2",
                //     "ExchangRateDecimalDigits": "2",
                //     "ClockDecimalDigits": "4"
                // },
                "TotalAmount": totalAmountOC,
                "TotalAmountWithoutVAT": null,
                "TotalVATAmount": null,
                "TotalDiscountAmount": null,
                "TotalSaleAmountOC": null,
                "TotalSaleAmount": null,
                "IsTaxReduction43": null,
                "IsTaxReduction": null,
                "TotalAmountInWordsVN": null,
                "TotalAmountInWordsUnsignNormalVN": null
            }
        }
    };

    // app.post('/api/finance/invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
    //     try {
    //         const transactionId = req.body.transactionId;
    //         const transaction = await app.model.tcHocPhiTransaction.get({ transId: transactionId });
    //         const sinhVien = await app.model.fwStudents.get({ mssv: transaction.customerId });
    //         const loaiHinhDaoTao = await app.model.dmSvLoaiHinhDaoTao.get({ ma: sinhVien.loaiHinhDaoTao });
    //         const nganh = await app.model.dtNganhDaoTao.get({ maNganh: sinhVien.maNganh });
    //         const khoa = await app.model.dmDonVi.get({ ma: nganh.khoa });
    //         const response = await app.getMisaAxiosInstance().post(url.hsmPublish, [
    //             compileInvoice(transaction, { ...sinhVien, loaiHinhDaoTao, nganh, khoa })
    //         ]);
    //         const data = app.parse(response.Data);
    //         if (!data || !data.length || data[0].ErrorCode) {
    //             throw 'Tạo hóa đơn lỗi' + data.ErrorCode;
    //         }
    //         const invoices = await Promise.all(data.map(async invoice => {
    //             return await app.model.tcHocPhiTransactionInvoice.create({
    //                 transactionId: transaction.transId,
    //                 invoiceTransactionId: invoice.TransactionID,
    //                 invoiceNumber: invoice.InvNo,
    //             });
    //         }));
    //         res.send({ items: invoices });
    //     } catch (error) {
    //         console.error(error);
    //         res.send({ error });
    //     }
    // });
    app.post('/api/finance/invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const { mssv, hocKy, namHoc } = req.body;
            if (await app.model.tcHocPhiTransactionInvoice.get({ mssv, hocKy, namHoc })) {
                throw 'Invocie đã tồn tại';
            }
            let hocPhi = await app.model.tcHocPhi.getInvoiceInfo(mssv, parseInt(namHoc), parseInt(hocKy));
            if (!hocPhi.rows || !hocPhi.rows.length) {
                throw 'Không có dữ liệu hóa đơn'
            }
            hocPhi = hocPhi.rows[0];
            const transactions = await app.model.tcHocPhiTransaction.getAll({ customerId: hocPhi.mssv, hocKy: hocPhi.hocKy, namHoc: hocPhi.namHoc }, '*', 'transDate');
            let response = null;
            try {

                response = await app.getMisaAxiosInstance().post(
                    url.hsmPublish,
                    [compileInvoice(hocPhi, transactions)]
                );
            } catch {
                throw (compileInvoice(hocPhi, transactions))
            }

            const data = app.parse(response.Data);
            if (!data || !data.length || data[0].ErrorCode) {
                throw 'Tạo hóa đơn lỗi' + data.ErrorCode;
            }
            const invoices = await Promise.all(data.map(async invoice => {
                return await app.model.tcHocPhiTransactionInvoice.create({
                    transactionId: 'transaction.transId',
                    invoiceTransactionId: invoice.TransactionID,
                    invoiceNumber: invoice.InvNo,
                    mssv: hocPhi.mssv, hocKy: hocPhi.hocKy, namHoc: hocPhi.namHoc
                });
            }));
            res.send({ items: invoices });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/finance/invoice/:id', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            const response = await app.getMisaAxiosInstance().post(url.view, [invoice.invoiceTransactionId]);
            request(response.Data).pipe(res);
        } catch (error) {
            res.status(400).send({ error });
        }
    })
}