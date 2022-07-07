module.exports = app => {
    const secretCode = 'Fkc6L70xjxXhvCTyTc4P';
    app.get('/api/hcmussh-testing', async (req, res) => {
        try {
            const code = req.query.code;
            if (secretCode == code) {
                const items = await app.model.dmBangDaoTao.getAll();
                res.send({ items });
            } else {
                res.end();
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/hcmussh-testing', async (req, res) => {
        try {
            const code = req.query.code;
            if (secretCode == code) {
                const items = await app.model.dmBangDaoTao.getAll();
                res.send({ items });
            } else {
                res.end();
            }
        } catch (error) {
            res.send({ error });
        }
    });
};