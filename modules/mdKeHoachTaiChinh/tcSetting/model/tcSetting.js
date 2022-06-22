module.exports = app => {
    app.model.tcSetting.getValue = async function () {
        const result = {};
        for (const key of arguments) {
            try {
                const item = await app.model.tcSetting.get({ key });
                result[key] = item ? item.value : null;
            } catch (error) {
                result[key] = null;
            }
        }
        return result;
    };

    app.model.tcSetting.setValue = async (data, done) => {
        let keys = Object.keys(data), errorSum = null;
        for (const key of keys) {
            try {
                const item = await app.model.tcSetting.get({ key });
                if (item) {
                    await app.model.tcSetting.update({ key }, { value: data[key] });
                } else {
                    await app.model.tcSetting.create({ key, value: data[key] });
                }
            } catch (error) {
                errorSum += error;
            }
        }

        done && done(errorSum);
        return errorSum;
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