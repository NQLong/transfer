// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcHocPhiTransaction.foo = () => { };
    app.model.tcHocPhiTransaction.sendEmailAndSms = async (data) => {
        const { student, hocKy, namHoc, amount, payDate } = data;
        let { hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, hocPhiSmsDong, tcAddress, tcPhone, tcEmail, tcSupportPhone, email, emailPassword } = await app.model.tcSetting.getValue('hocPhiEmailDongTitle', 'hocPhiEmailDongEditorText', 'hocPhiEmailDongEditorHtml', 'hocPhiSmsDong', 'tcAddress', 'tcPhone', 'tcEmail', 'tcSupportPhone', 'email', 'emailPassword');
        [hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, hocPhiSmsDong] = [hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, hocPhiSmsDong].map(item => item?.replaceAll('{name}', `${student.ho} ${student.ten}`)
            .replaceAll('{hoc_ky}', hocKy)
            .replaceAll('{nam_hoc}', `${namHoc} - ${parseInt(namHoc) + 1}`)
            .replaceAll('{mssv}', student.mssv)
            .replaceAll('{time}', app.date.viDateFormat(app.date.fullFormatToDate(payDate)))
            .replaceAll('{tc_address}', tcAddress)
            .replaceAll('{tc_phone}', tcPhone)
            .replaceAll('{tc_email}', tcEmail)
            .replaceAll('{amount}', amount.toString().numberWithCommas())
            .replaceAll('{support_phone}', tcSupportPhone) || '');
        app.email.normalSendEmail(email, emailPassword, student.emailTruong, '', hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, null);
        await app.sms.sendByViettel(student.dienThoaiCaNhan, hocPhiSmsDong, tcEmail);
    };
};