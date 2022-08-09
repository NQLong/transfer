module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5007: { title: 'Danh sách hóa đơn', link: '/user/finance/invoice' },
        },
    };
    const request = require('request');
    const axios = require('axios');

    app.permission.add({ name: 'tcInvoice:read', menu }, 'tcInvoice:write', 'tcInvoice:delete');
    const misaChunkSize = 30;

    app.permissionHooks.add('staff', 'addRolesTcInvoice', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcInvoice:read', 'tcInvoice:write', 'tcInvoice:delete');
            resolve();
        } else resolve();
    }));


    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview',
        download: '/code/itg/invoicepublished/downloadinvoice',
        cancel: '/code/itg/invoicepublished/cancel',
    };

    app.get('/user/finance/invoice', app.permission.check('tcInvoice:read'), app.templates.admin);


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

    const compileInvoice = (hocPhi, details, mauHoaDon) => {
        const invoiceDate = new Date(),
            refID = `${hocPhi.mssv}-${hocPhi.namHoc}-${hocPhi.hocKy}-${invoiceDate.getTime()}`,
            totalAmountOC = details.reduce((partialSum, detail) => partialSum + detail.soTien, 0);
        return {
            'RefID': refID,
            'OriginalInvoiceData': {
                'RefID': refID,
                'InvSeries': mauHoaDon,
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
                //Khoa
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
            const mauHoaDon = await app.model.tcSetting.getValue('meinvoiceMauHoaDon');
            let response = null;
            try {
                const misaInstance = await app.getMisaAxiosInstance();
                response = await misaInstance.post(
                    url.hsmPublish,
                    [compileInvoice(hocPhi, hocPhiDetails, mauHoaDon.meinvoiceMauHoaDon)]
                );
            } catch (error) {
                throw { message: 'Tạo hóa đơn lỗi', error };
            }

            const data = app.parse(response.Data);
            if (!data || !data.length || data[0].ErrorCode) {
                throw { message: 'Tạo hóa đơn lỗi', error: data[0].ErrorCode };
            }
            const invoices = await Promise.all(data.map(async invoice => {
                const refId = invoice.RefID;
                const [mssv, namHoc, hocKy, ngayPhatHanh] = refId.split('-');
                const newInvoice = await app.model.tcHocPhiTransactionInvoice.create({
                    refId,
                    invoiceTransactionId: invoice.TransactionID,
                    invoiceNumber: invoice.InvNo,
                    mssv, namHoc, hocKy, ngayPhatHanh
                });
                const emails = await getMailConfig();
                const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
                sendSinhVienInvoice(newInvoice, null, null, email);
                return newInvoice;
            }));
            res.send({ items: invoices });
        } catch (error) {
            res.send({ error });
        }
    });


    const createInvoiceList = async (list, config, email, meinvoiceMauHoaDon) => {
        try {

            const invoiceList = list.map(item => {
                const details = item.details ? item.details.split('|||').map(detail => {
                    const [loaiPhi, soTien] = detail.split('||');
                    return { loaiPhi, soTien: parseInt(soTien) };
                }) : [];
                return compileInvoice(item, details, meinvoiceMauHoaDon);
            });
            const instance = await app.getMisaAxiosInstance();
            const response = await instance.post(url.hsmPublish, invoiceList);
            const data = app.parse(response.Data);
            const invoices = await Promise.all(data.map(async invoice => {
                if (invoice.ErrorCode)
                    return null;
                const refId = invoice.RefID;
                const [mssv, namHoc, hocKy, ngayPhatHanh] = refId.split('-');
                try {
                    const item = await app.model.tcHocPhiTransactionInvoice.create({
                        refId: refId,
                        invoiceTransactionId: invoice.TransactionID,
                        invoiceNumber: invoice.InvNo,
                        mssv, hocKy, namHoc, ngayPhatHanh
                    });
                    sendSinhVienInvoice(item, null, config, email);
                    return item;
                } catch (createError) {
                    console.error(createError);
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
                return res.send({ result: { totalInvoice: 0, success: 0, error: 0 } });
            }
            const chunkList = app.arrayToChunk(list, misaChunkSize);
            const result = {
                totalInvoice: list.length,
                success: 0,
                error: 0
            };
            const emails = await getMailConfig();
            let mailList = [...emails];
            const config = await app.model.tcSetting.getValue('meinvoiceMauHoaDon', 'hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
            for (let i = 0; i < chunkList.length; i++) {
                if (!mailList)
                    mailList = [...emails];
                const email = mailList.splice(Math.floor(Math.random() * mailList.length), 1).pop();

                const ret = await createInvoiceList(chunkList[i], config, email, config.meinvoiceMauHoaDon);
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

    const getSettings = async () => await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy', 'hocPhiHuongDan');

    app.get('/api/finance/invoice/page/:pageNumber/:pageSize', app.permission.check('tcInvoice:read'), async (req, res) => {
        try {
            let filter = req.query.filter || {};
            const settings = await getSettings();
            const namHoc = filter.namHoc || settings.hocPhiNamHoc;
            const hocKy = filter.hocKy || settings.hocPhiHocKy;
            filter.tuNgay = filter.tuNgay || '';
            filter.denNgay = filter.denNgay || '';
            const filterData = app.stringify({ ...filter, namHoc, hocKy });
            const pageCondition = req.query.searchTerm;
            const page = await app.model.tcHocPhiTransactionInvoice.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter, settings: { namHoc, hocKy } }
            });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    const getMailConfig = async () => {
        const mailConfig = await app.model.tcSetting.getValue('taiChinhEmailPrefix', 'taiChinhEmailPassword');
        const mailList = [...Array(25).keys()].map(key => {
            return {
                email: mailConfig.taiChinhEmailPrefix + `0${key + 1}`.slice(-2) + '@hcmussh.edu.vn',
                password: mailConfig.taiChinhEmailPassword
            };
        });
        return mailList;
    };

    const sendSinhVienInvoice = async (invoice, sinhVien, config, email) => {
        sinhVien = sinhVien || await app.model.fwStudents.get({ mssv: invoice.mssv });
        config = config || await app.model.tcSetting.getValue('hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
        const url = `${app.isDebug ? app.debugUrl : app.rootUrl}/api/finance/invoice/${invoice.id}`;
        const title = config.hocPhiEmailTraHoaDonTitle.replace('{hoc_ky}', invoice.hocKy).replace('{nam_hoc}', invoice.namHoc);
        const html = config.hocPhiEmailTraHoaDonEditorHtml.replace('{link}', 'link').replace(/href=.*?>/, `href="${url}">`).replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv).replace('{hoc_ky}', invoice.hocKy).replace('{nam_hoc}', invoice.namHoc).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
        const text = config.hocPhiEmailTraHoaDonEditorText.replace('{link}', `dẫn ${url}`).replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.trim()).replace('{mssv}', sinhVien.mssv).replace('{hoc_ky}', invoice.hocKy).replace('{nam_hoc}', invoice.namHoc).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
        if (!app.isDebug)
            await app.email.normalSendEmail(email.email, email.password, sinhVien.emailTruong, [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        else
            await app.email.normalSendEmail(email.email, email.password, 'nqlong.dev@gmail.com', [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
    };

    app.post('/api/finance/invoice/mail', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = req.body.id;
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            // console.log(invoice);
            // const instance = await app.getMisaAxiosInstance();
            // let response = await instance.post(url.download, [invoice.invoiceTransactionId], { params: { downloadDataType: 'pdf' } });
            // const invoiceArray = app.parse(response.Data);
            // if (!invoiceArray.length || invoiceArray[0].ErrorCode) throw 'Lấy hóa đơn lỗi';
            // const fileContent = invoiceArray[0].Data;
            // const attachment = Buffer.from(fileContent, 'base64');
            const sinhVien = await app.model.fwStudents.get({ mssv: invoice.mssv });
            const mailData = await app.model.tcSetting.getValue('hocPhiEmailTraHoaDonEditorHtml', 'hocPhiEmailTraHoaDonEditorText', 'hocPhiEmailTraHoaDonTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
            const emails = await getMailConfig();
            const email = emails.splice(Math.floor(Math.random() * emails.length), 1).pop();
            await sendSinhVienInvoice(invoice, sinhVien, mailData, email);
            res.send();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/finance/invoice/cancel/:id', app.permission.check('tcInvoice:write'), async (req, res) => {
        try {
            const id = parseInt(req.params.id), lyDo = req.body.lyDo;
            if (!id || !lyDo) throw 'Dữ liệu không hợp lệ';
            const invoice = await app.model.tcHocPhiTransactionInvoice.get({ id });
            if (!invoice) throw 'Không tìm được hóa đơn';
            else if (invoice.lyDoHuy) throw 'Hóa đơn đã bị hủy';
            const invoiceDate = new Date(invoice.ngayPhatHanh);
            const instance = await app.getMisaAxiosInstance();
            const response = await instance.post(url.cancel, {
                TransactionID: invoice.invoiceTransactionId,
                InvNo: invoice.invoiceNumber,
                // RefDate: `${invoiceDate.getFullYear()}-${invoiceDate.getMonth() + 1}-${invoiceDate.getDate()}`,
                RefDate: app.toIsoString(invoiceDate).slice(0, 10),
                CancelReason: lyDo,
            });
            if (response.ErrorCode)
                throw 'Lỗi hệ thống';
            await app.model.tcHocPhiTransactionInvoice.update({ id }, { lyDoHuy: lyDo });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

};