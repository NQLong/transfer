module.exports = app => {

    Date.prototype.yyyymmdd = function() {
        return this.toISOString().slice(0, 10).replace(/-/g, '')
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
        },

        dateTimeFormat: (date, format) => {
            if (format == 'yyyy') return date.getFullYear();
            else if (format == 'mm/yyyy') return get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else if (format == 'dd/mm/yyyy') return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else return '';
        }
    };
};