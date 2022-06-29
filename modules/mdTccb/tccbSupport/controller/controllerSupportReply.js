module.exports = app => {
    app.post('/api/tccb/support-reply', app.permission.orCheck('tccbSupport:write', 'staff:login'), (req, res) => {
        let dataPhanHoi = req.body.dataPhanHoi,
            currentShcc = req.session.user.staff?.shcc || '';
        app.model.tccbSupportReply.create({ ...dataPhanHoi, nguoiPhanHoi: currentShcc }, (error, item) => {
            if (error) res.send({ error });
            else {
                app.model.tccbSupport.update({ id: dataPhanHoi.maYeuCau }, { approved: -1, modifiedDate: new Date().getTime(), shccAssign: currentShcc }, async (error, itemSupport) => {
                    let emailCanBoYeuCau = await app.getEmailByShcc(dataPhanHoi.canBoYeuCau);
                    app.notification.send({
                        toEmail: emailCanBoYeuCau,
                        title: `Nội dung phản hồi #${dataPhanHoi.maYeuCau}`,
                        subTitle: dataPhanHoi.noiDung,
                        icon: 'fa-universal-access',
                        iconColor: 'warning',
                        link: '/user/support',
                    });
                    res.send({ error, item, itemSupport });
                });
            }
        });
    });

    app.get('/api/tccb/support-reply/:maYeuCau', app.permission.orCheck('tccbSupport:write', 'staff:login'), (req, res) => {
        let maYeuCau = parseInt(req.params.maYeuCau);
        const user = req.session.user;
        app.model.tccbSupportReply.getTccbSupportReply(maYeuCau, (error, items) => {
            if (!user.permissions.includes('tccbSupport:write')) items.rows.filter(item => item.shcc == user.staff.shcc);
            res.send({ error, items: items.rows });
        });
    });
};
