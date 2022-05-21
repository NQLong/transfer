module.exports = app => {
    let constant = require('../constantTccbSupport'),
        { QT_MAPPER, ACTIONS } = constant;

    const EMAIL_OF_SUPPORTERS = [
        'doanthihong@hcmussh.edu.vn'
    ];
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3049: { title: 'Yêu cầu hỗ trợ thông tin', link: '/user/tccb/support', icon: 'fa-universal-access', backgroundColor: '#FE894F', pin: true },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1010: { title: 'Yêu cầu hỗ trợ thông tin', link: '/user/support', icon: 'fa-universal-access', backgroundColor: '#FE894F', pin: true, subTitle: 'Phòng Tổ chức cán bộ' },
        },
    };

    app.permission.add(
        { name: 'tccbSupport:read', menu },
        { name: 'staff:login', menu: menuStaff },
        { name: 'tccbSupport:write' },
        { name: 'tccbSupport:delete' },
    );

    app.get('/user/tccb/support', app.permission.check('tccbSupport:read'), app.templates.admin);
    app.get('/user/support', app.permission.check('staff:login'), app.templates.admin);

    //APIs-------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/support/page/:pageNumber/:pageSize', app.permission.orCheck('tccbSupport:read', 'staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            permissions = req.session.user.permissions;
        let shcc = req.session.user?.staff?.shcc;
        if (permissions.includes('tccbSupport:read')) shcc = '';
        let condition = { shcc };
        app.model.tccbSupport.searchPage(pageNumber, pageSize, app.stringify(condition), '', (error, page) => {
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
            {
                const sendNotification = (index = 0) => {
                    if (index > EMAIL_OF_SUPPORTERS.length - 1) {
                        res.send({ error, item });
                        return;
                    }
                    else {
                        app.notification.send({
                            toEmail: EMAIL_OF_SUPPORTERS[index],
                            title: 'Yêu cầu hỗ trợ',
                            subTitle: `${ACTIONS[dataTccbSupport.type].text} ${QT_MAPPER[dataTccbSupport.qt]}`,
                            icon: 'fa-universal-access',
                            iconColor: ACTIONS[dataTccbSupport.type].background,
                            link: '/user/tccb/support',
                        }).then(() => sendNotification(index + 1));
                    }
                };
                sendNotification();
            }
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
                res.send({ error, item });
            });
        };

        if (!qt || !type) {
            res.send({ error: 'Invalid parameters' });
        } else {
            if (type == 'update') {
                if (!qtId) {
                    res.send({ error: 'Invalid parameters' });
                } else {
                    let condition = {};
                    switch (qt) {
                        case 'canBo': condition = { shcc: qtId };
                            break;
                        default: condition = { id: qtId };
                            break;
                    }
                    app.model[qt][type](condition, data, (error, item) => {
                        if (error) {
                            res.send({ error, item });
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