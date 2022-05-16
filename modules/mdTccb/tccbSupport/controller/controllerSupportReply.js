module.exports = app => {
    app.post('/api/tccb/support-reply', app.permission.check('tccbSupport:write'), (req, res) => {
        let dataPhanHoi = req.body.dataPhanHoi,
            currentShcc = req.session.user.staff?.shcc || '';
        app.model.tccbSupportReply.create({ ...dataPhanHoi, nguoiPhanHoi: currentShcc }, (error, item) => {
            if (error) res.send({ error });
            else {
                app.model.tccbSupport.update({ id: dataPhanHoi.maYeuCau }, { approved: -1, modifiedDate: new Date().getTime(), shccAssign: currentShcc }, (error, itemSupport) => {
                    res.send({ error, item, itemSupport });
                });
            }
        });
    });

    app.get('/api/tccb/support-reply/:maYeuCau', app.permission.check('tccbSupport:write'), (req, res) => {
        let maYeuCau = parseInt(req.params.maYeuCau);
        app.model.tccbSupportReply.getTccbSupportReply(maYeuCau, (error, items) => {
            res.send({ error, items: items.rows });
        });
    });
};
