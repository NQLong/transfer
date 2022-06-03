// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.tcSetting.foo = () => { };

    app.model.tcSetting.getValue = (keys, done) => new Promise(resolve => {
        let result = {};
        const solveAnItem = (index) => {
            if (index < keys.length) {
                let key = keys[index];
                app.model.tcSetting.get({ key }, (error, item) => {
                    result[key] = (error == null && item) ? item.value : null;
                    solveAnItem(index + 1);
                });
            } else if (done) {
                done(result);
            } else resolve(result);
        };
        solveAnItem(0);
    });

    app.model.tcSetting.setValue = (data, done) => {
        let keys = Object.keys(data),
            errorSum = null;
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index];
                app.model.tcSetting.get({ key }, (error, item) => {
                    if (error) errorSum += error;
                    if (item) {
                        app.model.tcSetting.update({ key }, { value: data[key] }, error => {
                            if (error) errorSum += error;
                            solveAnItem(index + 1);
                        });
                    } else {
                        app.model.tcSetting.create({ key, value: data[key] }, error => {
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

    app.model.tcSetting.init = (data, done) => {
        const keys = Object.keys(data);
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index], value = data[key];
                if (typeof value == 'object') {
                    solveAnItem(index + 1);
                } else {
                    app.model.tcSetting.get({ key }, (error, item) => {
                        if (error) {
                            console.error(`Init tcSetting (${key}) has errors!`);
                            solveAnItem(index + 1);
                        } else if (item) {
                            solveAnItem(index + 1);
                        } else {
                            app.model.tcSetting.create({ key, value }, (error,) => {
                                if (error) {
                                    console.error(`Init tcSetting (${key}, ${value}) has errors!`);
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