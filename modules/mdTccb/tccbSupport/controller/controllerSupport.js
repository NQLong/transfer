module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3049: { title: 'Yêu cầu hỗ trợ thông tin', link: '/user/tccb/support', icon: 'fa-universal-access', backgroundColor: '#49BDAA', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbSupport:read', menu },
        { name: 'tccbSupport:write' },
        { name: 'tccbSupport:delete' },
    );

    app.get('/user/tccb/support', app.permission.check('tccbSupport:read'), app.templates.admin);

    //APIs-------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/support/page/:pageNumber/:pageSize', app.permission.check('tccbSupport:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.tccbSupport.searchPage(pageNumber, pageSize, '{}', '', (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = '';
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/support', app.permission.check('staff:login'), (req, res) => {
        let data = req.body.data,
            dataTccbSupport = req.body.dataTccbSupport,
            sentDate = new Date().getTime(),
            shcc = req.session.user.shcc;
        data = app.stringify(data);
        shcc ? app.model.tccbSupport.create({ data, ...dataTccbSupport, shcc, sentDate }, (error, item) => {
            res.send({ error, item });
        }) : res.send({ error: 'No permission!' });
    });

    app.put('/api/tccb/support', app.permission.check('tccbSupport:write'), (req, res) => {
        let data = req.body.data,
            id = req.body.id,
            dataTccbSupport = req.body.dataTccbSupport;
        data = app.stringify(data);
        app.model.tccbSupport.update({ id }, { data, ...dataTccbSupport }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/tccb/support/assign', app.permission.check('tccbSupport:write'), (req, res) => {
        let changes = req.query.data, shcc = req.session.user?.shcc || '';
        let data = app.parse(changes.data);
        let { qt, type, qtId, id } = changes;

        const updateApproved = () => {
            app.model.tccbSupport.update({ id }, {
                shccAssign: shcc,
                modifiedDate: new Date().getTime(),
                approved: 1
            }, (error, item) => {
                res.send(error, item);
            });
        };

        if (!qt || !type) {
            res.send({ error: 'Invalid parameters' });
        } else {
            if (type == 'update') {
                if (!qtId) {
                    res.send({ error: 'Invalid parameters' });
                    return;
                } else {
                    let condition = {};
                    switch (qt) {
                        case 'canBo': condition = { shcc: qtId };
                            break;
                        default: condition = { id: qtId };
                            break;
                    }
                    app.model[qt][type](condition, data, (error, item) => {
                        if (error || !item) {
                            res.send({ error });
                        } else updateApproved();
                    });
                }
            } else if (type == 'create') {
                app.model[qt][type](data, (error, item) => {
                    if (error || !item) {
                        res.send({ error });
                    } else updateApproved();
                });
            } else if (type == 'delete') {
                app.model[qt][type]({ id: qtId }, (error) => {
                    if (error) {
                        res.send({ error });
                    } else updateApproved();
                });
            }
        }
    });
};