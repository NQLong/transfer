module.exports = app => {

    String.prototype.upFirstChar = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.replaceAll = function (search, replacement) {
        return this.replace(new RegExp(search, 'g'), replacement);
    };

    String.prototype.normalizedName = function () {
        let convertToArray = this.toLowerCase().split(' ');
        let result = convertToArray.map(function (val) {
            return val.replace(val.charAt(0), val.charAt(0).toUpperCase());
        });
        return result.join(' ');
    };
    
    app.randomPassword = (length) => Math.random().toString(36).slice(-length);
};