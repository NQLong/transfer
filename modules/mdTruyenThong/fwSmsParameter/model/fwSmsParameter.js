// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.fwSmsParameter.foo = () => { };

    app.model.fwSmsParameter.replaceAllContent = async (id, data) => {
        let template = await app.model.fwSmsTemplate.get({ id });
        let listParams = await app.model.fwSmsParameter.getAll({
            statement: 'id IN (:listId)',
            parameter: { listId: template.thamSo.split(',') }
        });
        let colMapper = {};
        listParams.forEach(item => colMapper[item.ten] = item.columnName);

        listParams = listParams.groupBy('modelName');
        Object.keys(listParams).forEach(key => {
            listParams[key] = listParams[key].map(item => item.columnName).join(',');
        });

        let returnData = {};
        if (data.mssv) {
            for (const model of Object.keys(listParams)) {
                let item = await app.model[model].get({ mssv: data.mssv }, listParams[model]);
                returnData = Object.assign({}, returnData, item);
            }
        }

        let content = template.content;
        Object.keys(colMapper).forEach(key => {
            content = content.replaceAll(key, returnData[colMapper[key]]);
        });
        return content;
    };
};