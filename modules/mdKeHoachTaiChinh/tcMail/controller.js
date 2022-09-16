module.exports = app => {


    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5009: { title: 'Email', link: '/user/finance/email' } },
    };

    app.permission.add({ name: 'tcEmail:write', menu });
    app.get('/user/finance/email', app.permission.check('developer:login'), app.templates.admin);
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

    const sendSinhVien = async (sinhVien, config, email, filename, content) => {
        const title = config.hocPhiEmailNhacNhoTitle.replace('{hoc_ky}', '1').replace('{nam_hoc}', '2022');
        const html = config.hocPhiEmailNhacNhoEditorHtml.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.normalizedName().trim()).replace('{mssv}', sinhVien.mssv).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
        const text = config.hocPhiEmailNhacNhoEditorText.replace('{name}', `${sinhVien.ho} ${sinhVien.ten}`.normalizedName().trim()).replace('{mssv}', sinhVien.mssv).replace('{tc_address}', config.tcAddress).replace('{tc_phone}', config.tcPhone).replace('{support_phone}', config.tcSupportPhone).replace('{tc_email}', config.tcEmail);
        if (!app.isDebug)
            await app.email.normalSendEmail(email.email, email.password, sinhVien.emailTruong, [], (app.isDebug ? 'TEST: ' : '') + title, text, html, []);
        else
            await app.email.normalSendEmail(email.email, email.password, 'nqlong.dev@gmail.com', [], (app.isDebug ? 'TEST: ' : '') + title, text, html, [{ filename, content, encoding: 'base64' }]);
    };


    app.post('/api/finance/mail', app.permission.check('developer:login'), async (req, res) => {
        try {
            const { file } = req.body;
            const pdf = app.fs.readFileSync(file.path, 'base64');
            const sinhVienList = await app.model.fwStudents.getAll({
                statement: 'namTuyenSinh=:nam AND loaiHinhDaoTao in (:he) AND bacDaoTao=:bac',
                parameter: {
                    nam: 2022,
                    he: ['CQ', 'CLC',],
                    bac: 'DH'
                },
            }, 'ho, ten, mssv, emailTruong');
            const config = await app.model.tcSetting.getValue('hocPhiEmailNhacNhoEditorHtml', 'hocPhiEmailNhacNhoEditorText', 'hocPhiEmailNhacNhoTitle', 'tcPhone', 'tcAddress', 'tcSupportPhone', 'tcEmail');
            const emails = await getMailConfig();
            const chunks = await app.utils.arrayToChunk(sinhVienList, 100);
            let mailList = [...emails];
            for (const chunk of chunks) {
                if (!mailList || !mailList.length)
                    mailList = [...emails];
                const email = mailList.pop();
                await Promise.all(chunk.map(async sinhVien => {
                    try {
                        await sendSinhVien(sinhVien, { ...config }, email, file.ten, pdf);
                    } catch (error) {
                        await app.model.fwEmailLog.create({ usedEmail: email.email, toUser: sinhVien.mssv, toEmail: sinhVien.emailTruong, mailType: 'TC_GUIDELINE' });
                    }
                }));
            }
            res.send({});
        } catch (error) {
            console.error(error);
            res.send(error);
        }
    });

    app.uploadHooks.add('tcMail', (req, fields, files, params, done) =>
        app.permission.has(req, () => tcMailHandler(fields, files, done), done, 'developer:login'));

    const tcMailHandler = async (fields, files, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'tcMail' && files.tcMail && files.tcMail.length) {
            const file = files.tcMail[0];
            done({ file: { path: file.path, ten: file.originalFilename } });
        }
    };
};