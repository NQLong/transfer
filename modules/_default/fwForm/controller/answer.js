module.exports = app => {
    app.get('/api/answer/page/:eventId/:formId/:pageNumber/:pageSize', app.permission.check('form:read'), (req, res) => {
        let { eventId, formId, pageNumber, pageSize } = req.params;
        app.model.fwAnswer.getPage(pageNumber, pageSize, { eventId, formId: formId !== 'null' ? formId : null }, (error, page) => res.send({ error, page }));
    });

    app.get('/api/answer/count/:eventId/:formId', (req, res) => {
        app.model.fwAnswer.count({ eventId: req.params.eventId, formId: req.params.formId }, (error, total) => {
            res.send({ error, total: total.rows[0]['COUNT(*)'] || 0 });
        });
    });

    app.get('/api/answer/item/:answerId', app.permission.check('form:read'), (req, res) =>
        app.model.fwAnswerRecord.getAll({ answerId: req.params.answerId }, (error, item) => {
            res.send({ error, item });
        }));

    app.post('/api/answer', app.permission.check('form:write'), (req, res) => {
        const body = req.body.newData;
        app.model.fwAnswer.get({ user: body.user, eventId: body.eventId }, (error, answer) => {
            if (error) {
                res.send({ error });
            } else if (answer) {
                res.send({ exist: true });
            } else {
                app.model.fwAnswer.create(body, (error, item) => res.send({ error, item }));
            }
        });
    });
    app.put('/api/answer', app.permission.check('form:write'), (req, res) => {
        const changes = req.body.changes;
        if (changes.record && changes.record == 'empty') changes.record = [];
        app.model.fwAnswer.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/answer', app.permission.check('form:delete'), (req, res) => {
        app.model.fwAnswerRecord.delete({ answerId: req.body.id }, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.fwAnswer.delete({ id: req.body.id }, (error) => res.send({ error }));
            }
        });
    });

    // User =========================================================================================================================================
    app.post('/api/home/answer', app.permission.check(), (req, res) => {
        const { newData } = req.body;
        app.model.fwAnswer.create({ userAnswer: newData.user, eventId: newData.eventId, answeredDate: new Date().getTime(), formId: newData.formId }, (error, answer) => {
            if (error)
                res.send({ error });
            else {
                let records = newData.record;
                if (records) {
                    for (let record of records) {
                        record.answerId = answer.id;
                    }
                    app.model.fwAnswerRecord.createMany(records, (error) => res.send({ error }));
                }
                else
                    res.send({ error: null });
            }
        });
    });

    app.delete('/api/answer/clear-participants-session', app.permission.check(), (req, res) => {
        req.session.participants && delete req.session.participants;
        res.send({});
    });

    app.post('/api/answer/check', app.permission.check(), (req, res) => {
        app.model.fwAnswer.getAll({ eventId: req.body.eventId, formId: req.body.formId }, (error, items) => {
            if (error) {
                res.send({ error });
            } else {
                if (req.session.user) {
                    let check = false;
                    for (let item of items) {
                        if (item.userAnswer === req.session.user.email) {
                            check = true;
                            break;
                        }
                    }
                    res.send({ error, check });
                }
            }
        });
    });

    // Hook upload files ---------------------------------------------------------------------------------------------------------------------------s
    const importRegistration = (req, srcPath, sendResponse) => {
        const workbook = app.excel.create();
        workbook.xlsx.readFile(srcPath).then(() => {
            app.fs.deleteFile(srcPath);
            const worksheet = workbook.getWorksheet(1);
            let index = 1, participants = [];
            while (true) {
                index++;
                let organizationId = worksheet.getCell('A' + index).value;
                if (organizationId) {
                    organizationId = organizationId.toString().trim();
                    const lastname = worksheet.getCell('B' + index).value.toString().trim();
                    const firstname = worksheet.getCell('C' + index).value.toString().trim();
                    const email = worksheet.getCell('D' + index).value.toString().trim();
                    participants.push({ lastname, firstname, email, organizationId, active: true });
                } else {
                    req.session.participants = participants;
                    sendResponse({ number: participants.length });
                    break;
                }
            }
        });
    };
    const registrationImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'registrationImportData' && files.RegistrationImportData && files.RegistrationImportData.length > 0) {
            console.log('Hook: registrationImportData');
            importRegistration(req, files.RegistrationImportData[0].path, done);
        }
    };
    app.uploadHooks.add('registrationImportData', (req, fields, files, params, done) => registrationImportData(req, fields, files, params, done));
};
