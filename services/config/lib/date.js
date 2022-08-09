module.exports = app => {

    Date.prototype.yyyymmdd = function() {
        return this.toISOString().slice(0, 10).replace(/-/g, '');
    };
    Date.prototype.roundDate = function () {
        this.setHours(0, 0, 0, 0);
        return this;
    };
    Date.newDate = function (n = 0) {
        let date = new Date();
        date.setDate(date.getDate() + n);
        return date;
    };

    const get2 = (x) => ('0' + x).slice(-2);

    app.date = {
        dateFormat: (date) => {
            return get2(date.getMonth() + 1) + '/' + get2(date.getDate()) + '/' + date.getFullYear();
        },

        viDateFormat: (date) => {
            return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
        },

        viTimeFormat: (date) => {
            return get2(date.getHours()) + ':' + get2(date.getMinutes());
        }
    };
};