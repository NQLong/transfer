module.exports = app => {
    const request = require('request');
    const axios = require('axios');

    app.permission.add('tcInvoice:read', 'tcInvoice:write', 'tcInvoice:delete');
    const misaChunkSize = 30;


    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview'
    };


    const getMisaToken = async () => {
        try {
            const { meinvoiceAppId: appid, meinvoiceMaSoThue: taxcode, meinvoiceUsername: username, matKhauMeinvoice: password } = await app.model.tcSetting.getValue('meinvoiceAppId', 'meinvoiceMaSoThue', 'meinvoiceUsername', 'matKhauMeinvoice');
            const instance = await app.getMisaAxiosInstance(false);
            const response = await instance.post(url.login, {
                appid,
                taxcode,
                username,
                password,
            });
            return response.Data;
        } catch (error) {
            return null;
        }
    };

    app.getMisaAxiosInstance = async (errorHandler = true) => {
        const baseUrl = (await app.model.tcSetting.getValue('meinvoiceUrl')).meinvoiceUrl;
        const axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 100000,
            headers: {
                Authorization: 'Bearer ' + app.misaInvoiceAccessToken,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });

        axiosInstance.interceptors.response.use(async (response) => {
            const data = response.data || {};
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
                            return (await app.getMisaAxiosInstance(false))(originalRequest);
                        }
                    }
                }
                return Promise.reject(response.data);
            }
            return response.data;
        }, (error) => {
            console.error('MisaInvoice: error');
            return Promise.reject(error);
        });
        return axiosInstance;
    };
    app.misaInvoiceAccessToken = 'Bearer Token';

    const compileInvoice = (hocPhi, details) => {
        const invoiceDate = new Date(),
            refID = `${hocPhi.mssv}-${hocPhi.namHoc}-${hocPhi.hocKy}-${invoiceDate.getTime()}`,
            totalAmountOC = details.reduce((partialSum, detail) => partialSum + detail.soTien, 0);
        return {
            'RefID': refID,
            'OriginalInvoiceData': {
                'RefID': refID,
                'InvSeries': '2C22TCH',
                'InvoiceName': 'Hóa đơn thu học phí',
                'InvDate': app.toIsoString(invoiceDate),
                'CurrencyCode': 'VND',
                'ExchangeRate': 1.0,
                'PaymentMethodName': 'TM/CK',
                'IsInvoiceSummary': false,
                'SellerTaxCode': '0101243150-382',
                //MSSV
                'Customfield1': hocPhi.mssv,
                //Khóa lớp
                'Customfield2': hocPhi.tenLoaiHinhDaoTao,
                //Hệ
                'Customfield3': hocPhi.tenKhoa,
                // 'SellerAddress': 'Tầng X, Tòa nhà Y, Số zzz Cầu Giấy - Hà Nội',
                // 'BuyerLegalName': 'Công ty cổ phần MISA (Test - 666)',
                // 'BuyerTaxCode': '0101243150-666',
                'BuyerFullName': `${hocPhi.ho} ${hocPhi.ten}`.trim().toUpperCase(),
                // 'BuyerAddress': '',
                'BuyerEmail': hocPhi.email,
                'ContactName': null,
                'DiscountRate': 0,
                'TotalAmountWithoutVATOC': null,
                // 'TotalVATAmountOC': 15000.0,
                'TotalDiscountAmountOC': 0,
                'TotalAmountOC': totalAmountOC,
                'TotalAmountInWords': app.numberToVnText(`${totalAmountOC}`) + ' đồng.',
                'OriginalInvoiceDetail': details.length ? details.map((detail, index) => {
                    return {
                        'ItemType': 1,
                        'LineNumber': index + 1,
                        'SortOrder': index + 1,
                        'ItemCode': 'HOC-PHI',
                        'ItemName': detail.loaiPhi,
                        // 'UnitName': null,
                        // 'Quantity': 1.0,
                        // 'UnitPrice': 150000.0,
                        'DiscountRate': null,
                        'DiscountAmountOC': null,
                        'DiscountAmount': null,
                        'AmountOC': detail.soTien,
                        'Amount': detail.soTien,
                        // 'VATRateName': '10%',
                        // 'VATAmountOC': 15000.0,
                        // 'VATAmount': 15000.0
                    };
                }) : null,
                'TaxRateInfo': [
                    // {
                    //     // 'VATRateName': '10%',
                    //     // 'AmountWithoutVATOC': 150000.0,
                    //     // 'VATAmountOC': 15000.0
                    // }
                ],
                'FeeInfo': null,
                // 'OptionUserDefined': {
                //     'MainCurrency': 'VND',
                //     'AmountDecimalDigits': '2',
                //     'AmountOCDecimalDigits': '2',
                //     'UnitPriceOCDecimalDigits': '2',
                //     'UnitPriceDecimalDigits': '2',
                //     'QuantityDecimalDigits': '3',
                //     'CoefficientDecimalDigits': '2',
                //     'ExchangRateDecimalDigits': '2',
                //     'ClockDecimalDigits': '4'
                // },
                'TotalAmount': totalAmountOC,
                'TotalAmountWithoutVAT': null,
                'TotalVATAmount': null,
                'TotalDiscountAmount': 0,
                'TotalSaleAmountOC': 0,
                'TotalSaleAmount': null,
                'IsTaxReduction43': null,
                'IsTaxReduction': null,
                'TotalAmountInWordsVN': null,
                'TotalAmountInWordsUnsignNormalVN': null
            }
        };
    };

    app.post('/api/finance/invoice', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const { mssv, hocKy, namHoc } = req.body;
            if (await app.model.tcHocPhiTransactionInvoice.get({ mssv, hocKy, namHoc })) {
                throw 'Hóa đơn đã tồn tại';
            }
            let hocPhi = await app.model.tcHocPhi.getInvoiceInfo(mssv, parseInt(namHoc), parseInt(hocKy));
            if (!hocPhi.rows || !hocPhi.rows.length) {
                throw 'Không có dữ liệu hóa đơn';
            }
            hocPhi = hocPhi.rows[0];
            if (hocPhi.congNo) {
                throw 'Dữ liệu hóa đơn không hợp lệ';
            }

            let hocPhiDetails = await app.model.tcHocPhi.getDetail(hocPhi.mssv, hocPhi.hocKy, hocPhi.namHoc);
            hocPhiDetails = hocPhiDetails.rows;
            if (!hocPhiDetails.length) {
                throw 'Không có dữ liệu giao dịch';
            }
            let response = null;
            try {
                const misaInstance = await app.getMisaAxiosInstance();
                response = await misaInstance.post(
                    url.hsmPublish,
                    [compileInvoice(hocPhi, hocPhiDetails)]
                );
            } catch (error) {
                throw { message: 'Tạo hóa đơn lỗi', error };
            }

            const data = app.parse(response.Data);
            if (!data || !data.length || data[0].ErrorCode) {
                throw { message: 'Tạo hóa đơn lỗi', error: data[0].ErrorCode };
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
            res.send({ error });
        }
    });


    const createInvoiceList = async list => {
        try {

            const invoiceList = list.map(item => {
                const details = item.details ? item.details.split('|||').map(detail => {
                    const [loaiPhi, soTien] = detail.split('||');
                    return {loaiPhi, soTien: parseInt(soTien)};
                }) : [];
                return compileInvoice(item, details);
            });
            const instance = await app.getMisaAxiosInstance();
            const response = await instance.post(url.hsmPublish, invoiceList);
            const data = app.parse(response.Data);
            const invoices = await Promise.all(data.map(async invoice => {
                if (invoice.ErrorCode)
                    return null;
                const refId = invoice.RefID;
                const [mssv, namHoc, hocKy] = refId.split('-');
                try {
                    return await app.model.tcHocPhiTransactionInvoice.create({
                        transactionId: 'transaction.transId',
                        invoiceTransactionId: invoice.TransactionID,
                        invoiceNumber: invoice.InvNo,
                        mssv: mssv, hocKy: hocKy, namHoc: namHoc
                    });
                } catch (createError) {
                    return null;
                }
            }));
            return invoices.reduce((stat, invoice) => {
                if (invoice)
                    stat.success += 1;
                else
                    stat.error += 1;
                return stat;
            }, { success: 0, error: 0 });
        } catch (error) {
            return {
                success: 0,
                error: list.length
            };
        }
    };

    app.post('/api/finance/invoice/list', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const { tuNgay, denNgay, namHoc, hocKy } = req.body;
            const { rows: list } = await app.model.tcHocPhi.getInvoiceList(tuNgay, denNgay, hocKy, namHoc);
            if (!list.length) {
                return res.send({
                    totalInvoice: 0,
                    success: 0,
                    error: 0
                });
            }
            const chunkList = app.arrayToChunk(list, misaChunkSize);
            const result = {
                totalInvoice: list.length,
                success: 0,
                error: 0
            };
            for (let i = 0; i < chunkList.length; i++) {
                const ret = await createInvoiceList(chunkList[i]);
                result.success += ret.success;
                result.error += ret.error;
            }

            return res.send({ result });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/invoice/:id', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const instance = await app.getMisaAxiosInstance();
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            if (!invoice) throw 'Hóa đơn không tồn tại';
            const response = await instance.post(url.view, [invoice.invoiceTransactionId]);
            request(response.Data).pipe(res);
        } catch (error) {
            res.status(400).send({ error });
        }
    });
};