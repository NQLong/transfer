module.exports = app => {
    app.readyHooks.add('schedule', {
        ready: () => app.schedule,
        run: () => {
            // TODO: Long
            // app.schedule('0 0 * * *', () => {
            //     // const today = new Date();
            //
            // });
        },
    });
};