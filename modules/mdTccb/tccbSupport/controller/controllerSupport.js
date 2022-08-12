module.exports = app => {
    let constant = require('../constantTccbSupport'),
        { QT_MAPPER, ACTIONS } = constant;

    const EMAIL_OF_SUPPORTERS = [
        'tan.nn@hcmussh.edu.vn'
    ];
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3049: { title: 'Xử lý yêu cầu thông tin', link: '/user/tccb/support', icon: 'fa-universal-access', backgroundColor: '#5cb85c', pin: true },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1010: { title: 'Yêu cầu hỗ trợ thông tin', link: '/user/support', icon: 'fa-universal-access', backgroundColor: '#FE894F', pin: true, subTitle: 'Phòng Tổ chức - Cán bộ' },
        },
    };

    app.permission.add(
        { name: 'tccbSupport:manage', menu },
        { name: 'staff:login', menu: menuStaff },
        { name: 'tccbSupport:write' },
        { name: 'tccbSupport:delete' },
    );

    app.get('/user/tccb/support', app.permission.check('tccbSupport:manage'), app.templates.admin);
    app.get('/user/support', app.permission.check('staff:login'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleSupport', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbSupport:manage', 'tccbSupport:write', 'tccbSupport:delete');
            resolve();
        } else resolve();
    }));

    //APIs-------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/support/page/:pageNumber/:pageSize', app.permission.orCheck('tccbSupport:manage', 'staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            permissions = req.session.user.permissions;
        let shcc = req.session.user?.staff?.shcc;
        if (permissions.includes('tccbSupport:manage')) shcc = '';
        let condition = { shcc };
        app.model.tccbSupport.searchPage(pageNumber, pageSize, app.utils.stringify(condition), '', (error, page) => {
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
            oldData = req.body.oldData,
            dataTccbSupport = req.body.dataTccbSupport,
            sentDate = new Date().getTime(),
            { firstName, lastName, shcc } = req.session.user;
        let fullName = `${lastName || ''} ${firstName || ''}`;
        data = app.utils.stringify(data);
        oldData = app.utils.stringify(oldData);
        shcc ? app.model.tccbSupport.create({ data, ...dataTccbSupport, shcc, sentDate, oldData }, (error, item) => {
            {
                const sendNotification = (index = 0) => {
                    if (index > EMAIL_OF_SUPPORTERS.length - 1) {
                        res.send({ error, item });
                        return;
                    }
                    else {
                        app.notification.send({
                            toEmail: EMAIL_OF_SUPPORTERS[index],
                            title: `Cán bộ ${fullName} yêu cầu hỗ trợ`,
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
        data = app.utils.stringify(data);
        app.model.tccbSupport.update({ id }, { data, ...dataTccbSupport }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.get('/api/tccb/support/assign', app.permission.check('tccbSupport:write'), (req, res) => {
        let changes = req.query.data,
            { firstName, lastName, shcc = '' } = req.session.user;
        let fullName = `${lastName || ''} ${firstName || ''}`;
        fullName = 'Phòng Tổ chức - Cán bộ';
        let data = app.utils.parse(changes.data);
        let { qt, type, qtId, id } = changes;
        const updateApproved = () => {
            app.model.tccbSupport.update({ id }, {
                shccAssign: shcc,
                modifiedDate: new Date().getTime(),
                approved: 1
            }, async (error, item) => {
                if (!error) {
                    let emailCanBoYeuCau = await app.getEmailByShcc(changes.shcc);
                    app.notification.send({
                        toEmail: emailCanBoYeuCau,
                        title: 'Yêu cầu đã được duyệt',
                        subTitle: `Bởi ${fullName}`,
                        icon: 'fa-universal-access',
                        iconColor: 'success',
                        link: '/user/support',
                    });
                }
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