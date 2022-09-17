// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcHocPhiTransaction.foo = () => { };
    app.model.tcHocPhiTransaction.sendEmailAndSms = async (data) => {
        try {
            if (student.dienThoaiCaNhan) {
                let smsContent = await app.model.fwSmsParameter.replaceAllContent(1, student);
                student.dienThoaiCaNhan && app.sms.sendByViettel(student.dienThoaiCaNhan, smsContent, tcEmail);
            }
            const { student, hocKy, namHoc, amount, payDate } = data;
            let { hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, tcAddress, tcPhone, tcEmail, tcSupportPhone, email, emailPassword } = await app.model.tcSetting.getValue('hocPhiEmailDongTitle', 'hocPhiEmailDongEditorText', 'hocPhiEmailDongEditorHtml', 'tcAddress', 'tcPhone', 'tcEmail', 'tcSupportPhone', 'email', 'emailPassword');
            [hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml] = [hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml].map(item => item?.replaceAll('{name}', `${student.ho} ${student.ten}`)
                .replaceAll('{hoc_ky}', hocKy)
                .replaceAll('{nam_hoc}', `${namHoc} - ${parseInt(namHoc) + 1}`)
                .replaceAll('{mssv}', student.mssv)
                .replaceAll('{time}', app.date.viDateFormat(app.date.fullFormatToDate(payDate)))
                .replaceAll('{tc_address}', tcAddress)
                .replaceAll('{tc_phone}', tcPhone)
                .replaceAll('{tc_email}', tcEmail)
                .replaceAll('{amount}', amount.toString().numberDisplay())
                .replaceAll('{support_phone}', tcSupportPhone) || '');
            app.email.normalSendEmail(email, emailPassword, student.emailTruong, '', hocPhiEmailDongTitle, hocPhiEmailDongEditorText, hocPhiEmailDongEditorHtml, null);

            app.notification.send({
                toEmail: student.emailTruong,
                title: 'Thanh toán thành công',
                subTitle: `Số tiền: ${amount.toString().numberDisplay()}, HK${hocKy}-${namHoc} lúc ${app.date.viDateFormat(app.date.fullFormatToDate(payDate))}`,
                icon: 'fa-usd', iconColor: 'success'
            });
        } catch (error) {
            console.error('Send email and sms tcHocPhi fail!');
        }
    };
};