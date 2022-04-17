module.exports = () => {

  Array.prototype.contains = function (pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
  };

  Array.prototype.removeByValue = function (value) {
    const index = this.indexOf(value);
    if (index >= 0) {
      this.splice(index, 1);
    }
  };

  Array.prototype.exists = function (pattern) {
    return pattern.some(item => this.includes(item));
  };

  Array.prototype.groupBy = function (key) {
    return this.reduce(
      (result, item) => ({
        ...result,
        [key && item[key]]: [
          ...(result[item[key]] || []),
          item,
        ],
      }),
      {},
    );
  };
};