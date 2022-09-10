// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dtSettings.foo = () => { };
    app.model.dtSettings.getValue = async function () {
        const result = {};
        for (const key of arguments) {
            try {
                const item = await app.model.dtSettings.get({ key });
                result[key] = item ? item.value : null;
            } catch (error) {
                result[key] = null;
            }
        }
        return result;
    };

    app.model.dtSettings.setValue = async (data, done) => {
        let keys = Object.keys(data), errorSum = null;
        for (const key of keys) {
            try {
                const item = await app.model.dtSettings.get({ key });
                if (item) {
                    await app.model.dtSettings.update({ key }, { value: data[key] });
                } else {
                    await app.model.dtSettings.create({ key, value: data[key] });
                }
            } catch (error) {
                errorSum += error;
            }
        }

        done && done(errorSum);
        return errorSum;
    };
};