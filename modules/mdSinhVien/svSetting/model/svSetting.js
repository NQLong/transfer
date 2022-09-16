module.exports = app => {
    app.model.svSetting.getValue = async function () {
        const result = {};
        for (const key of arguments) {
            try {
                const item = await app.model.svSetting.get({ key });
                result[key] = item ? item.value : null;
            } catch (error) {
                result[key] = null;
            }
        }
        return result;
    };

    app.model.svSetting.setValue = async (data, done) => {
        let keys = Object.keys(data), errorSum = null;
        for (const key of keys) {
            try {
                const item = await app.model.svSetting.get({ key });
                if (item) {
                    await app.model.svSetting.update({ key }, { value: data[key] });
                } else {
                    await app.model.svSetting.create({ key, value: data[key] });
                }
            } catch (error) {
                errorSum += error;
            }
        }

        done && done(errorSum);
        return errorSum;
    };

    app.model.svSetting.init = (data, done) => {
        const keys = Object.keys(data);
        const solveAnItem = index => {
            if (index < keys.length) {
                let key = keys[index], value = data[key];
                if (typeof value == 'object') {
                    solveAnItem(index + 1);
                } else {
                    app.model.svSetting.get({ key }, (error, item) => {
                        if (error) {
                            console.error(`Init svSetting (${key}) has errors!`);
                            solveAnItem(index + 1);
                        } else if (item) {
                            solveAnItem(index + 1);
                        } else {
                            app.model.svSetting.create({ key, value }, (error,) => {
                                if (error) {
                                    console.error(`Init svSetting (${key}, ${value}) has errors!`);
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

    app.model.svSetting.initLimitCtsvMail = () => {
        const listMail = [];
        for (let i = 0; i < 25; i++) {
            listMail.push(400);
        }
        app.database.redis.set('ctsvMail', listMail.toString());
    };

    app.model.svSetting.getEmail = () => new Promise(resolve => {
        app.database.redis.get('ctsvMail', async (_, value) => {
            let listMail = value.split(',').map(item => parseInt(item));
            let index = listMail.findIndex(item => item > 0) + 1;
            const { defaultEmail, defaultPassword } = await app.model.svSetting.getValue('defaultEmail', 'defaultPassword');
            const email = `${defaultEmail}${('0' + index).slice(-2)}@hcmussh.edu.vn`;
            resolve({ email, password: defaultPassword, index });
        });
    });

    app.model.svSetting.updateLimit = (index) => app.database.redis.get('ctsvMail', async (_, value) => {
        let listMail = value.split(',').map(item => parseInt(item));
        let item = listMail[parseInt(index) - 1];
        item = parseInt(item) - 1;
        listMail.splice(parseInt(index) - 1, 1, item);
        app.database.redis.set('ctsvMail', listMail.toString());
    });
};