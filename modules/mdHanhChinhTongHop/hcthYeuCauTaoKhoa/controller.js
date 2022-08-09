module.exports = app => {
    const forge = require('node-forge');
    const { trangThaiRequest } = require('../constant');

    const staffMenu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            505: { title: 'Yêu cầu tạo chữ ký', link: '/user/hcth/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c' },
        },
    };

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1057: { title: 'Tạo khoá', link: '/user/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#db2c2c', groupIndex: 5 },
        },
    };

    app.permission.add({ name: 'hcthYeuCauTaoKhoa:read', menu: staffMenu }, 'hcthYeuCauTaoKhoa:write', 'hcthYeuCauTaoKhoa:delete');
    app.permission.add({ name: 'manager:write', menu: menu });
    app.get('/user/hcth/yeu-cau-tao-khoa', app.permission.check('hcthYeuCauTaoKhoa:read'), app.templates.admin);
    app.get('/user/yeu-cau-tao-khoa', app.permission.check('hcthYeuCauTaoKhoa:read'), app.templates.admin);

    app.get('/api/hcth/yeu-cau-tao-khoa/user/page/:pageNumber/:pageSize', app.permission.check('staff:login'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            const shcc = req.session.user.shcc;
            filter.canBoTao = shcc;
            const filterData = app.stringify(filter);
            const pageCondition = req.query.searchTerm;
            const page = await app.model.hcthYeuCauTaoKhoa.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter }
            });
            // res.send({ items: [] });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/khoa/user', app.permission.orCheck('rectors:login', 'manager:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const khoa = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (khoa) {
                const yeuCau = await app.model.hcthYeuCauTaoKhoa.get({ id: khoa.yeuCau });
                res.send({ item: { khoa, yeuCau } });
            } else {
                res.send({ item: {} });
            }
        } catch (error) {
            res.send({ error });
        }
    });


    const genKey = async (id, shcc, passphrase) => {
        // const fs = require('fs');
        const setting = await app.model.hcthSetting.getValue('rootPassphrase');
        const privateKey = app.fs.readFileSync(app.path.join(app.assetPath, 'ca/hcmussh.key'), 'utf-8');
        const cert = app.fs.readFileSync(app.path.join(app.assetPath, 'ca/hcmussh.pem'), 'utf-8');
        // const caKey = (forge.pki.decryptRsaPrivateKey(privateKey, 'benn1904'));
        const caKey = forge.pki.decryptRsaPrivateKey(privateKey, setting.rootPassphrase);
        const caCert = forge.pki.certificateFromPem(cert);
        const hostKeys = forge.pki.rsa.generateKeyPair(2048);
        const getCertNotBefore = () => {
            let twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
            let year = twoDaysAgo.getFullYear();
            let month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0');
            let day = twoDaysAgo.getDate();
            return new Date(`${year}-${month}-${day} 00:00:00Z`);
        };

        // Get Certificate Expiration Date (Valid for 365 Days)
        const getCertNotAfter = (notBefore) => {
            let ninetyDaysLater = new Date(notBefore.getTime() + 60 * 60 * 24 * 365 * 1000);
            let year = ninetyDaysLater.getFullYear();
            let month = (ninetyDaysLater.getMonth() + 1).toString().padStart(2, '0');
            let day = ninetyDaysLater.getDate();
            return new Date(`${year}-${month}-${day} 23:59:59Z`);
        };

        // // Get CA Expiration Date (Valid for 100 Years)
        // const getCANotAfter = (notBefore) => {
        //     let year = notBefore.getFullYear() + 100;
        //     let month = (notBefore.getMonth() + 1).toString().padStart(2, '0');
        //     let day = notBefore.getDate();
        //     return new Date(`${year}-${month}-${day} 23:59:59Z`);
        // }

        const makeNumberPositive = (hexString) => {
            let mostSignificativeHexDigitAsInt = parseInt(hexString[0], 16);

            if (mostSignificativeHexDigitAsInt < 8) return hexString;

            mostSignificativeHexDigitAsInt -= 8;
            return mostSignificativeHexDigitAsInt.toString() + hexString.substring(1);
        };

        // Generate a random serial number for the Certificate
        const randomSerialNumber = () => {
            return makeNumberPositive(forge.util.bytesToHex(forge.random.getBytesSync(20)));
        };
        // Define the attributes/properties for the Host Certificate
        const attributes = [{
            shortName: 'C',
            value: 'VN'
        }, {
            shortName: 'ST',
            value: 'Ho Chi Minh'
        }, {
            shortName: 'L',
            value: 'DAI HOC KHOA HOC VA XA HOI NHAN VAN'
        }, {
            shortName: 'CN',
            value: `${shcc}-${id}`
        }];

        const extensions = [{
            name: 'basicConstraints',
            cA: false
        }, {
            name: 'nsCertType',
            server: true
        }, {
            name: 'subjectKeyIdentifier'
        }, {
            name: 'authorityKeyIdentifier',
            authorityCertIssuer: true,
            serialNumber: caCert.serialNumber
        }, {
            name: 'keyUsage',
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true
        }, {
            name: 'extKeyUsage',
            serverAuth: true
        },
            // {
            //     name: 'subjectAltName',
            //     altNames: validDomains.map(domain => { return { type: 2, value: domain } })
            // }
        ];

        // Create an empty Certificate
        let newHostCert = forge.pki.createCertificate();
        // Set the attributes for the new Host Certificate
        newHostCert.publicKey = hostKeys.publicKey;
        newHostCert.serialNumber = randomSerialNumber();
        newHostCert.validity.notBefore = getCertNotBefore();
        newHostCert.validity.notAfter = getCertNotAfter(newHostCert.validity.notBefore);
        newHostCert.setSubject(attributes);
        newHostCert.setIssuer(caCert.subject.attributes);
        newHostCert.setExtensions(extensions);

        // Sign the new Host Certificate using the CA
        newHostCert.sign(caKey, forge.md.sha512.create());

        let p12Asn1 = forge.pkcs12.toPkcs12Asn1(
            hostKeys.privateKey, newHostCert, passphrase,
            { algorithm: '3des' });

        // base64-encode p12
        let p12Der = forge.asn1.toDer(p12Asn1).getBytes();
        let p12b64 = forge.util.encode64(p12Der);

        return { p12b64, publicKey: forge.pki.publicKeyToPem(hostKeys.publicKey) };
    };

    app.post('/api/hcth/khoa/user/download', app.permission.orCheck('rectors:login', 'manager:write'), async (req, res) => {
        try {
            const { passphrase } = req.body;
            const shcc = req.session.user.shcc,
                email = req.session.user.email;
            const khoa = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (!khoa) throw 'Không tìm thấy khóa người dùng';
            if (khoa.publicKey) throw 'Khóa đã được gửi đến người dùng';
            const { p12b64, publicKey } = await genKey(khoa.id, shcc, passphrase);
            const setting = await app.model.hcthSetting.getValue('email', 'emailPassword', 'debugEmail');
            await app.email.normalSendEmail(setting.email, setting.emailPassword, app.isDebug ? setting.debugEmail : email, [], 'Khóa người dùng mới', 'Tệp tin khóa người dùng mới', 'Tệp tin khóa người dùng mới', [{
                filename: `${shcc}-${khoa.id}.p12`,
                content: p12b64,
                encoding: 'base64'
            }]);
            await app.model.hcthUserPublicKey.update({ id: khoa.id }, { publicKey });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/yeu-cau-tao-khoa/page/:pageNumber/:pageSize', app.permission.check('hcthYeuCauTaoKhoa:read'), async (req, res) => {
        try {
            const filter = req.query.filter || {};
            const filterData = app.stringify(filter);
            const pageCondition = req.query.searchTerm;
            const page = await app.model.hcthYeuCauTaoKhoa.searchPage(parseInt(req.params.pageNumber), parseInt(req.params.pageSize), pageCondition, filterData);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({
                page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, filter }
            });
            // res.send({ items: [] });
        } catch (error) {
            res.send({ error });
        }
    });


    app.post('/api/hcth/yeu-cau-tao-khoa', app.permission.orCheck('manager:write', 'rectors:login'), async (req, res) => {
        try {
            const data = req.body;
            const shcc = req.session.user.shcc;
            const currentKey = await app.model.hcthUserPublicKey.get({ shcc, kichHoat: 1 });
            if (currentKey) throw 'Không thể tạo yêu cầu khi có khóa đang được kích hoạt';
            const hasRequest = await app.model.hcthYeuCauTaoKhoa.get({ shcc, trangThai: trangThaiRequest.CHO_DUYET.id });
            if (hasRequest) throw 'Bạn đã có 1 yêu cầu đang chờ duyệt';
            await app.model.hcthYeuCauTaoKhoa.create({ ...data, shcc, ngayTao: new Date().getTime(), trangThai: trangThaiRequest.CHO_DUYET.id });
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/hcth/yeu-cau-tao-khoa/trang-thai/:id', app.permission.check('hcthYeuCauTaoKhoa:write'), async (req, res) => {
        try {
            const id = req.params.id;
            const request = await app.model.hcthYeuCauTaoKhoa.get({ id });
            if (!request) throw 'Yêu cầu không tồn tại';
            if (request.trangThai != trangThaiRequest.CHO_DUYET.id) throw 'Trạng thái yêu cầu không hợp lệ';
            const shcc = req.session.user.shcc;
            const trangThai = req.body.trangThai;
            switch (trangThai) {
                case trangThaiRequest.DA_DUYET.id:
                    await approveRequest(request, shcc);
                    break;
                case trangThaiRequest.TU_CHOI.id:
                    await refuseRequest(request, shcc);
                    break;
                default:
            }
            res.send({});
        } catch (error) {
            res.send({ error });
        }
    });

    const approveRequest = async (request, shcc) => {
        await app.model.hcthYeuCauTaoKhoa.update({ id: request.id }, { trangThai: trangThaiRequest.DA_DUYET.id, capNhatBoi: shcc, ngayCapNhat: new Date().getTime() });
        await app.model.hcthUserPublicKey.create({ yeuCau: request.id, shcc: request.shcc, });
        //TODO: send notification
    };

    const refuseRequest = async (request, shcc) => {
        await app.model.hcthYeuCauTaoKhoa.update({ id: request.id }, { trangThai: trangThaiRequest.TU_CHOI.id, capNhatBoi: shcc, ngayCapNhat: new Date().getTime() });
        //TODO: send notification
    };

    app.post('/api/hcth/chu-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const { shcc, dataUrl } = req.body;

            if (!app.fs.existsSync(
                app.path.join(app.assetPath, 'key')
            )) {
                app.createFolder(app.path.join(app.assetPath, 'key'));
            }

            const destPath = app.path.join(app.assetPath, 'key', `${shcc}.png`);
            console.log(destPath);

            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

            app.fs.writeFileSync(destPath, base64Data, 'base64');

            let item = await app.model.hcthChuKy.get({ shcc });

            if (!item) item = await app.model.hcthChuKy.create({ shcc, ngayTao: Date.now() });

            res.send({ item, error: null });

        } catch (error) {
            res.send({ error });
        }
    });

    app.uploadHooks.add('hcthSignatureFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => hcthSignatureFile(req, fields, files, params, done), done, 'staff:login'));

    const hcthSignatureFile = (req, fields, files, params, done) => {
            if (
                fields.userData &&
                fields.userData[0] &&
                fields.userData[0].startsWith('hcthSignatureFile') &&
                files.hcthSignatureFile &&
                files.hcthSignatureFile.length > 0) {
                    const srcPath = files.hcthSignatureFile[0].path,
                        validUploadFileType = ['.png', '.jpg', '.jpeg'],
                        baseNamePath = app.path.extname(srcPath);
                    if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
                        done && done({ error: 'Định dạng tập tin không hợp lệ!' });
                        app.deleteFile(srcPath);
                    } else {
                        done && done({ item: files.hcthSignatureFile[0] });
                    }
            }
        };
    
    app.get('/api/hcth/chu-ky', app.permission.orCheck('rectors:login', 'manager:write'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc;
            const signature = await app.model.hcthChuKy.get({ shcc });
            if (signature) {
                res.send({ item: signature });
            } else {
                res.send({ item: {} });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/hcth/chu-ky/download', app.permission.orCheck('rectors:login', 'manager:write'), (req, res) => {
        const shcc = req.session.user.shcc;
        const dir = app.path.join(app.assetPath, '/key');
        return res.sendFile(app.path.join(dir, `${shcc}.png`));
    });
};