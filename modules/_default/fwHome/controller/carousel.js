module.exports = app => {
    app.get('/api/carousel/page/:pageNumber/:pageSize', app.permission.check('component:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let user = req.session.user,
            condition = {
                maDonVi: user.permissions.includes('website:manage') ? '0' : user.maDonVi
            };
        app.model.homeCarousel.getPage(pageNumber, pageSize, condition, (error, page) => {
            const response = {};
            if (error || page == null) {
                response.error = 'Danh sách tập ảnh không sẵn sàng!';
            } else {
                let list = page.list.map(item => app.clone(item, { content: null }));
                response.page = app.clone(page, { list });
            }
            res.send(response);
        });
    });

    app.get('/api/carousel/all', app.permission.check('component:read'), (req, res) => app.model.homeCarousel.getAll((error, items) => res.send({ error, items })));

    app.get('/api/carousel/:id', app.permission.check('component:read'), (req, res) => app.model.homeCarousel.get({ id: req.params.id }, (error, carousel) => {
        if (error || carousel == null) {
            res.send({ error: 'Lỗi khi lấy danh sách hình ảnh!' });
        } else {
            app.model.homeCarouselItem.getAll({ carouselId: carousel.id }, (error, items) => {
                if (error || items == null) {
                    res.send({ item: app.clone(carousel, { items: null }) });
                } else {
                    sortByPriority(items);
                    res.send({ item: app.clone(carousel, { items }) });
                }
            });
        }

        const sortByPriority = (items) => {
            return items.sort((a, b) => {
                if (a.priority < b.priority) {
                    return -1;
                }
                if (a.priority > b.priority) {
                    return 1
                }
                return 0;
            })
        }
    }));

    app.post('/api/carousel', app.permission.check('component:read'), (req, res) => {
        let body = req.body.data, user = req.session.user;
        body.maDonVi = user.permissions.includes('website:manage') ? '0' : (user.maDonVi ? user.maDonVi : -1);
        app.model.homeCarousel.create(body, (error, carousel) => {
            res.send({ error, carousel })
        })
    });

    app.put('/api/carousel', app.permission.check('component:read'), (req, res) => {
        let permissions = req.session.user.permissions;
        if (permissions.includes('website:write') || permissions.includes('website:manage') || permissions.includes('component:write'))
            app.model.homeCarousel.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/carousel', app.permission.check('component:write'), (req, res) =>
        app.model.homeCarousel.delete({ id: req.body.id }, error => res.send({ error })));

    app.post('/api/carousel/item', app.permission.check('component:read'), (req, res) => {
        let newData = req.body.data;
        app.model.homeCarouselItem.getAll({ carouselId: req.body.data.carouselId }, (error, carousel) => {
            if (error || carousel == null) {
                newData.priority = 1;
            } else {
                let priorityMax = findMax(carousel);
                newData.priority = priorityMax + 1;
                app.model.homeCarouselItem.create(newData, (error, item) => {
                    if (item && req.session.carouselItemImage) {
                        const conditions = { carouselId: newData.carouselId, priority: newData.priority };
                        app.adminUploadImage('carouselItem', app.model.homeCarouselItem, conditions, req.session.carouselItemImage, req, res);
                    } else {
                        res.send({ error, item });
                    }
                })
            }
        })
    });

    app.put('/api/carousel/item', app.permission.check('component:read'), (req, res) => {
        app.model.homeCarouselItem.update({ carouselId: req.body.carouselId, priority: req.body.priority },
            req.body.changes, (error, item) => { res.send({ error, item }) })
    });

    app.put('/api/carousel/item/priority', app.permission.check('component:write'), (req, res) => {
        app.model.homeCarouselItem.sortable({ newPriority: req.body.newPriority, oldPriority: req.body.oldPriority, carouselId: req.body.carouselId }, error => res.send({ error }))
    });

    app.put('/api/carousel/item/swap', app.permission.check('component:read'), (req, res) => {
        const isMoveUp = req.body.isMoveUp.toString() == 'true';
        const { carouselId, priority } = req.body;
        app.model.homeCarouselItem.getAll({ carouselId: carouselId }, (error, carousel) => {
            if (carousel != null) {
                let maxPriority = findMax(carousel);
                swapPriority(carouselId, priority, priority, isMoveUp, maxPriority);
            }
        });

        const swapPriority = (carouselId, priority, target, isMoveUp, maxPriority) => {
            if (priority == 0) res.send({ error: 'error' });
            if (priority == maxPriority + 1) res.send({ error: 'error' });
            else {
                const nextPriority = isMoveUp ? (parseInt(priority) - 1) : (parseInt(priority) + 1);
                app.model.homeCarouselItem.get({ carouselId: carouselId, priority: nextPriority }, (error, item) => {
                    if (item) {
                        app.model.homeCarouselItem.update({ carouselId: carouselId, priority: nextPriority }, { priority: maxPriority + 1 }, (err1, item1) => {
                            if (!err1) {
                                app.model.homeCarouselItem.update({ carouselId: carouselId, priority: target }, { priority: nextPriority }, (err2, item2) => {
                                    if (!err2) {
                                        app.model.homeCarouselItem.update({ carouselId: carouselId, priority: maxPriority + 1 }, { priority: target }, (err3, item3) => res.send(item3));
                                    }
                                });
                            }
                        })
                    }
                    else swapPriority(carouselId, nextPriority, target, isMoveUp, maxPriority)
                })
            }
        }
    });

    app.delete('/api/carousel/item', app.permission.check('component:read'), (req, res) => {
        let permissions = req.session.user.permissions;
        if (permissions.includes('website:write') || permissions.includes('website:manage') || permissions.includes('component:write'))
            app.model.homeCarouselItem.delete({ carouselId: req.body.carouselId, priority: req.body.priority }, (error, item) => res.send({ error, carouselId: item && item.carouselId }))
    });

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/home/carousel/:id', (req, res) => app.model.homeCarousel.get({ id: req.params.id }, (error, carousel) => {
        if (error || carousel == null) {
            res.send({ error: 'Error when got images!' });
        } else {
            app.model.homeCarouselItem.getAll({ carouselId: carousel.id, active: 1 }, '*', 'priority DESC', (error, items) => {
                if (error || items == null) {
                    res.send({ error: 'Error when got images!' });
                } else {
                    res.send({ item: app.clone(carousel, { items }) });
                }
            });
        }
    }));


    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    app.createFolder(app.path.join(app.publicPath, '/img/carouselItem'));

    const uploadCarouselItemImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0].startsWith('CarouselItem:') && files.CarouselItemImage && files.CarouselItemImage.length > 0) {
            console.log('Hook: uploadCarouselItemImage => carousel image upload');
            let userData = fields.userData[0].split(' ');
            const conditions = userData[1] == 'new' ? 'new' : { carouselId: userData[1], priority: userData[2] }
            app.uploadComponentImage(req, 'carouselItem', app.model.homeCarouselItem, conditions, files.CarouselItemImage[0].path, done);
        }
    };
    app.uploadHooks.add('uploadCarouselItemImage', (req, fields, files, params, done) => {
        let permissions = req.session.user.permissions;
        if (permissions.includes('website:write') || permissions.includes('website:manage') || permissions.includes('component:write'))
            app.permission.has(req, () => uploadCarouselItemImage(req, fields, files, params, done), done, 'component:read')
    });
};

const findMax = (arr) => {
    let max = 0;
    arr.forEach(element => {
        if (element.priority > max) max = element.priority;
    });
    return max;
}