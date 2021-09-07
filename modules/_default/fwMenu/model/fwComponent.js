module.exports = app => {
    app.model.fwComponent.viewTypes = [
        '<empty>',
        'carousel', 'video', 'feature', 'last news', 'last events', 'all events',
        'notification', 'admission', 'gallery', 'content', 'contact', 'all news', 'all divisions', 'tin tức chung', 'thư viện'
    ];

    app.model.fwComponent.deleteComponent = (id, done) => {
        app.model.fwComponent.get({ statement: 'componentIds LIKE :id', parameter: { id: `%${id}%` } }, (error, parentComponent) => {
            if (error)
                done && done(error);
            else if (parentComponent) {
                const componentIds = parentComponent.componentIds.split(',').filter(componentId => componentId != id).join(',');
                app.model.fwComponent.update({ id: parentComponent.id }, { componentIds }, () => { });
            }
            app.model.fwComponent.get({ id }, (error, component) => {
                if (component) {
                    app.model.fwComponent.delete({ id }, (error) => {
                        if (component.componentIds) {
                            const childrenComponent = component.componentIds.split(',').filter(Number).map(Number);
                            const removeChildrenComponent = index => {
                                if (index < childrenComponent.length)
                                    app.model.fwComponent.deleteComponent(childrenComponent[index],
                                        () => removeChildrenComponent(++index));
                                else
                                    done && done(null);
                            };
                            removeChildrenComponent(0);
                        } else
                            done && done(error);
                    });
                } else
                    done && done(error);
            });
        });
    };
    app.model.fwComponent.addViewTypes = (viewType) => {
        if (!app.model.fwComponent.viewTypes.includes(viewType)) {
            app.model.fwComponent.viewTypes.push(viewType);
        }
    };

    app.model.fwComponent.getMenuComponents = (menu, done) => {
        app.model.fwComponent.getAll({}, '*', 'priority', (error, components) => {
            if (error || components == null) components = [];
            const getComponentView = (index) => {
                if (index < components.length) {
                    const component = components[index];
                    if (component.id == menu.componentId) menu.component = component;
                    if (component.viewType && component.viewId) {
                        const viewType = component.viewType;
                        let modelName = '';
                        if (viewType === 'carousel' || viewType === 'gallery')
                            modelName = 'homeCarousel';
                        else if (viewType === 'video')
                            modelName = 'homeVideo';
                        else if (viewType === 'feature')
                            modelName = 'homeFeature';
                        else if (viewType === 'content')
                            modelName = 'homeContent';
                        else if (viewType === 'all news')
                            modelName = 'fwCategory';
                        else if (viewType === 'all divisions')
                            modelName = 'dmLoaiDonVi';
                        app.model[modelName].get({ viewId: component.viewId }, (error, item) => {
                            component.viewName = item ? item.title : '<empty>';
                            getComponentView(index + 1);
                        });
                    } else {
                        component.viewName = '<empty>';
                        getComponentView(index + 1);
                    }
                } else {
                    if (menu.component) {
                        const list = [menu.component];
                        while (list.length) {
                            const parentComponent = list.shift();
                            for (let i = 0; i < components.length; i++) {
                                const childComponent = components[i];
                                if (parentComponent.id == childComponent.parentId) {
                                    if (parentComponent.components) {
                                        parentComponent.components.push(childComponent);
                                    } else {
                                        parentComponent.components = [childComponent];
                                    }
                                    list.push(childComponent);
                                }
                            }
                        }
                    }
                    done();
                }
            };
            getComponentView(0);
        });
    };
    app.model.fwComponent.createNew = (className, style, viewType, viewId, detail, done) => {
        app.dbConnection.execute('BEGIN :ret:=component_create_new(:className, :style, :viewType, :viewId, :detail); END;',
            { ret: { dir: app.oracleDB.BIND_OUT, type: app.oracleDB.NUMBER }, className, style, viewType, viewId, detail }, done);
    };
};