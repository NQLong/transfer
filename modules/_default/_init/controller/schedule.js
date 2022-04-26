module.exports = app => {
    app.readyHooks.add('schedule', {
        ready: () => app.schedule,
        run: () => {
            // TODO: Long
            app.schedule('0 8 * * *', app.hcthCongVanDen.notifyExpired);
        }
    });
};