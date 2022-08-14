// eslint-disable-next-line no-unused-vars
module.exports = app => {
    Array.prototype.contains = function (pattern) {
        return pattern.reduce((result, item) => result && this.includes(item), true);
    };
    
    Array.prototype.exists = function (pattern) {
        return pattern.some(item => this.includes(item));
    };
    
    Array.prototype.removeByValue = function (value) {
        const index = this.indexOf(value);
        if (index >= 0) this.splice(index, 1);
    };
    
    Array.prototype.count = function (value) {
        return this.filter(i => i === value).length;
    };
    
    Array.invert = function (array, width) {
        const template = {};
        width > 0 || (width = 1);
        for (const record of array)
            Object.keys(record).forEach(key => template[key] || (template[key] = []));
        for (const record of array)
            Object.keys(template).forEach(key => template[key].push(record[key] || ''));
        const length = array.length;
        const entries = Object.entries(template);
        const result = [];
        for (let i = 0; i < Math.ceil(length / 5); i++) {
            const chunk = [];
            for (let j = 0; j < entries.length; j++) {
                const title = entries[j][0];
                chunk[j] = { title };
                const chunkArr = entries[j][1].slice(width * i, width * (i + 1));
                chunkArr.concat(Array(width - chunkArr.length).fill('')).forEach((item, index) => chunk[j]['index' + index] = item);
            }
            result.push(chunk);
        }
        return result;
    };
    
    if (!Array.prototype.flat) {
        Array.prototype.flat = function (depth = 1) {
            return this.reduce(function (flat, toFlatten) {
                return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
            }, []);
        };
    }
};