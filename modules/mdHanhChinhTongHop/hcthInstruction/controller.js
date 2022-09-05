module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1060: { title: 'Hướng dẫn sử dụng', link: '/user/instruction', icon: 'fa-list', backgroundColor: '#7FB77E', groupIndex: 5 },
        },
    };

    app.permission.add({ name: 'staff:login', menu: menu });

    app.get('/user/instruction', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/instruction/:id', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/instruction/page/:pageNumber/:pageSize', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);

            const page = await app.model.hcthInstruction.getPage(pageNumber, pageSize);
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/instruction/:id', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const instruction = await app.model.hcthInstruction.get({ id });
            if (!instruction) throw { message: 'Hướng dẫn sử dụng không tồn tại' };
            res.send({ item: instruction });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/instruction', app.permission.orCheck('developer:login', 'staff:login'), async (req, res) => {
        try {
            const { id, changes } = req.body,
                { noiDung, tieuDe } = changes;

            app.model.hcthInstruction.update({ id }, { noiDung, tieuDe });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/instruction', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const data = req.body.data,
                { tieuDe, noiDung } = data;
            await app.model.hcthInstruction.create({ tieuDe, noiDung });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/instruction', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const id = req.body.id;

            await app.model.hcthInstruction.delete({ id });
            res.send({ error: null });
        } catch (error) {
            res.send({ error });
        }
    });
};