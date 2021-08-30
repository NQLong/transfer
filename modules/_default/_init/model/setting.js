module.exports = app => {
    app.model.setting.getValue = (keys, done) => {
        let result = {};
        const solveAnItem = (index) => {
            if (index < keys.length) {
                let key = keys[index];
                app.model.setting.get({ key }, (error, item) => {
                    result[key] = (error == null && item) ? item.value : null;
                    solveAnItem(index + 1);
                });
            } else if (done) {
                done(result);
            }
        };
        solveAnItem(0);
    };

    app.model.setting.setValue = (data, done) => {
        let keys = Object.keys(data),
            errorSum = null;
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index];
                app.model.setting.get({ key }, (error, item) => {
                    if (error) errorSum += error;
                    if (item) {
                        app.model.setting.update({ key }, { value: data[key] }, error => {
                            if (error) errorSum += error;
                            solveAnItem(index + 1);
                        });
                    } else {
                        app.model.setting.create({ key, value: data[key] }, error => {
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

    app.model.setting.init = (data, done) => {
        const keys = Object.keys(data);
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index], value = data[key];
                if (typeof value == 'object') {
                    solveAnItem(index + 1);
                } else {
                    app.model.setting.get({ key }, (error, item) => {
                        if (error) {
                            console.error(`Init setting (${key}) has errors!`);
                            solveAnItem(index + 1);
                        } else if (item) {
                            solveAnItem(index + 1);
                        } else {
                            app.model.setting.create({ key, value }, (error, item) => {
                                if (error) {
                                    console.error(`Init setting (${key}, ${value}) has errors!`);
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
}
