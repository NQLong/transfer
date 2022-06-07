// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.hcthSetting.foo = () => { };
    app.model.hcthSetting.getValue = function () {
        return new Promise(resolve => {
            const result = {};
            const solveAnItem = (index) => {
                console.log(arguments);
                if (index < arguments.length) {
                    const key = arguments[index];
                    console.log(key);
                    if (typeof key == 'function') {
                        key(result);
                        resolve(result);
                    } else {
                        app.model.hcthSetting.get({ key }, (error, item) => {
                            console.log(item);
                            result[key] = (error == null && item) ? item.value : null;
                            solveAnItem(index + 1);
                        });
                    }
                } else {
                    resolve(result);
                }
            };
            solveAnItem(0);
        });
    };

    app.model.hcthSetting.setValue = (data, done) => {
        let keys = Object.keys(data),
            errorSum = null;
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index];
                app.model.hcthSetting.get({ key }, (error, item) => {
                    if (error) errorSum += error;
                    if (item) {
                        app.model.hcthSetting.update({ key }, { value: data[key] }, error => {
                            if (error) errorSum += error;
                            solveAnItem(index + 1);
                        });
                    } else {
                        app.model.hcthSetting.create({ key, value: data[key] }, error => {
                            if (error) errorSum += error;
                            solveAnItem(index + 1);
                        });
                    }
                });
            } else if (done) {
                done(errorSum);
            }
        };
        solveAnItem(0);
    };

    app.model.hcthSetting.init = (data, done) => {
        const keys = Object.keys(data);
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index], value = data[key];
                if (typeof value == 'object') {
                    solveAnItem(index + 1);
                } else {
                    app.model.hcthSetting.get({ key }, (error, item) => {
                        if (error) {
                            console.error(`Init hcthSetting (${key}) has errors!`);
                            solveAnItem(index + 1);
                        } else if (item) {
                            solveAnItem(index + 1);
                        } else {
                            app.model.hcthSetting.create({ key, value }, (error,) => {
                                if (error) {
                                    console.error(`Init hcthSetting (${key}, ${value}) has errors!`);
                                } else {
                                    solveAnItem(index + 1);
                                }
                            });
                        }
                    });
                }
            } else if (done) {
                done();
            }
        };
        solveAnItem(0);
    };
};