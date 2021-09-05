module.exports = app => {

  Array.prototype.contains = function (pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
  };

  Array.prototype.removeByValue = function (value) {
    const index = this.indexOf(value);
    if (index >= 0) {
      this.splice(index, 1);
    }
  };
};