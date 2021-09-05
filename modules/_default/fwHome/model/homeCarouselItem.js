module.exports = app => {
    // app.model.homeCarouselItem.foo = () => { };
    app.model.homeCarouselItem.sortable = async (condition, done) => {
        const { newPriority, oldPriority, carouselId } = condition;
        app.model.homeCarouselItem.getAll({carouselId: carouselId}, '*', '', (error, items) => {
            let sqlUpdate = '';
            if (newPriority > oldPriority) {
                items.forEach(item => {
                    sqlUpdate += `WHEN PRIORITY=${item.priority} AND CAROUSEL_ID=${carouselId} THEN ${
                        (item.priority > oldPriority && item.priority <= newPriority) ? (item.priority - 1) : ((item.priority == oldPriority) ? newPriority : item.priority)
                        } `;
                });
            } else {
                items.forEach(item => {
                    sqlUpdate += `WHEN PRIORITY=${item.priority} AND CAROUSEL_ID=${carouselId} THEN ${
                        (item.priority < oldPriority && item.priority >= newPriority) ? (item.priority + 1) : ((item.priority == oldPriority) ? newPriority : item.priority)
                        } `;
                });
            }
            app.dbConnection.execute(`UPDATE FW_HOME_CAROUSEL_ITEM SET PRIORITY=CASE ${sqlUpdate}END`, error => {
                if (done) return done(error);
            });
        });
    };
};