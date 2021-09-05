module.exports = app => {
    // app.model.fwDraft.foo = () => { };
    app.model.fwDraft.create2 = (data, done) => {
        app.model.fwDraft.create(data, (error, item) => {
            if (error) {
                done(error);
            } else {
                const title = app.language.parseAll(data.title);
                if (title.vi.toLowerCase().includes('bản nháp') && title.en.toLowerCase().includes('draft')) {
                    let image = '/img/draft/' + item.id + '.jpg';// nguy hiem
                    const srcPath = app.path.join(app.publicPath, '/img/avatar.png'), destPath = app.path.join(app.publicPath, image);
                    app.fs.copyFile(srcPath, destPath, error => {
                        if (error) {
                            done(error);
                        } else {
                            image += '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.fwDraft.update({ id: item.id }, { image }, done);
                        }
                    });
                } else {
                    const modelName = 'fw' + data.documentType[0].toUpperCase() + data.documentType.substring(1);
                    app.model[modelName].get({ id: data.documentId }, (error, result) => {
                        const extPath = app.path.extname(result.image);
                        const postFix = data.documentType === 'draft' ? '' : data.documentType.upFirstChar();
                        let image = '/img/draft' + postFix + '/' + item.id + (extPath.indexOf('?t=') != -1 ? extPath.substring(0, extPath.indexOf('?t=')) : extPath);
                        const srcPath = app.path.join(app.publicPath, (result.image.indexOf('?t=') != -1) ? result.image.substring(0, result.image.indexOf('?t=')) : result.image);
                        const destPath = app.path.join(app.publicPath, image);
                        image += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.fs.copyFile(srcPath, destPath, error => {
                            if (error) {
                                done(error);
                            } else {
                                app.model.fwDraft.update({ id: item.id }, { image }, done);
                            }
                        });
                    });
                }
            }
        });
    };

    app.model.fwDraft.delete2 = (condition, done) => {
        app.model.fwDraft.get(condition, (error, draft) => {
            if (error || draft === null) {
                done(error);
            } else {
                if (app.data && app.data.numberOfNews) app.data.numberOfNews--;
                app.deleteImage(draft.image);
                app.model.fwDraft.delete(condition, done);
            }
        });
    };

    app.model.fwDraft.toNews = (id, done) => {
        app.model.fwDraft.get({ id }, (error, result) => {
            if (error) {
                done(error);
            } else {
                const news = {
                    title: result.title,
                    isInternal: result.isInternal,
                    abstract: JSON.parse(result.documentJson).abstract,
                    content: JSON.parse(result.documentJson).content,
                    startPost: JSON.parse(result.documentJson).startPost,
                    stopPost: JSON.parse(result.documentJson).stopPost,
                    attachment: JSON.parse(result.documentJson).attachment,
                    maDonVi: result.maDonVi,
                    displayCover: result.displayCover,
                    isTranslate: 0,
                    language: 'vi',
                };
                app.model.fwNews.get({ id: result.documentId }, (error, value) => {
                    if (error) {
                        done(error);
                    } else {
                        const srcPath = app.path.join(app.publicPath, (result.image.indexOf('?t=') != -1) ? result.image.substring(0, result.image.indexOf('?t=')) : result.image);
                        if (value) {
                            const destPath = app.path.join(app.publicPath, (value.image.indexOf('?t=') != -1) ? value.image.substring(0, value.image.indexOf('?t=')) : value.image);
                            news.image = '/img/news/' + app.path.basename(destPath) + '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.fwNews.update({ id: result.documentId }, news, (error, item) => {
                                if (error) {
                                    done(error);
                                }
                                else {

                                    app.fs.copyFile(srcPath, destPath, error => {
                                        if (error) {
                                            done(error);
                                        } else {
                                            app.model.fwDraft.delete2({ id: result.id }, error => {
                                                if (error)
                                                    done(error);
                                                else
                                                    app.model.fwNewsCategory.delete({ newsId: result.documentId }, (error) => {
                                                        let categories = JSON.parse(result.documentJson).categories;
                                                        if (categories.length && categories.indexOf('-1') === -1) {
                                                            categories = categories.map(categoryId => ({ newsId: item.id, categoryId }));
                                                            app.model.fwNewsCategory.createMany(categories, error => done(error, item));
                                                        }
                                                        else
                                                            done(error, item);
                                                    });
                                            });
                                        }
                                    });
                                }

                            });
                        } else {
                            app.model.fwNews.create2(news, (error, item) => {
                                if (error) {
                                    done(error);
                                }
                                else {
                                    const destPath = app.path.join(app.publicPath, item.image);
                                    news.link = JSON.parse(result.documentJson).link;
                                    news.createdDate = JSON.parse(result.documentJson).createdDate;
                                    app.fs.copyFile(srcPath, destPath, error => {
                                        if (error) {
                                            done(error);
                                        } else {
                                            app.model.fwDraft.delete2({ id: result.id }, error => {
                                                let categories = JSON.parse(result.documentJson).categories;
                                                if (categories.length && categories.indexOf('-1') === -1) {
                                                    categories = categories.map(categoryId => ({ newsId: item.id, categoryId }));
                                                    app.model.fwNewsCategory.createMany(categories, error => done(error, item));
                                                } else
                                                    done(error, item);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    app.model.fwDraft.toEvent = (id, done) => {
        app.model.fwDraft.get({ id }, (error, result) => {
            if (error) {
                done(error);
            } else {
                const event = {
                    title: result.title,
                    isInternal: result.isInternal,
                    name: JSON.parse(result.documentJson).name,
                    location: JSON.parse(result.documentJson).location,
                    link: JSON.parse(result.documentJson).link,
                    maxRegisterUsers: JSON.parse(result.documentJson).maxRegisterUsers,
                    abstract: JSON.parse(result.documentJson).abstract,
                    content: JSON.parse(result.documentJson).content,
                    trainingPoint: JSON.parse(result.documentJson).trainingPoint,
                    socialWorkDay: JSON.parse(result.documentJson).socialWorkDay,
                    createdDate: JSON.parse(result.documentJson).createdDate,
                    startPost: JSON.parse(result.documentJson).startPost,
                    stopPost: JSON.parse(result.documentJson).stopPost,
                    startRegister: JSON.parse(result.documentJson).startRegister,
                    stopRegister: JSON.parse(result.documentJson).stopRegister,
                    startEvent: JSON.parse(result.documentJson).startEvent,
                    stopEvent: JSON.parse(result.documentJson).stopEvent,
                };

                app.model.fwEvent.create2(event, (error, item) => {
                    if (error)
                        done(error);
                    else {
                        const srcPath = app.path.join(app.publicPath, (result.image.indexOf('?t=') != -1) ? result.image.substring(0, result.image.indexOf('?t=')) : result.image);
                        const destPath = app.path.join(app.publicPath, item.image);
                        event.link = JSON.parse(result.documentJson).link;
                        event.createdDate = JSON.parse(result.documentJson).createdDate;
                        app.fs.copyFile(srcPath, destPath, error => {
                            if (error)
                                done(error);
                            else
                                app.model.fwDraft.delete2({ id: result.id }, error => {
                                    const categories = JSON.parse(result.documentJson).categories.map(categoryId => ({ eventId: item.id, categoryId }));
                                    if (categories.length)
                                        app.model.fwEventCategory.createMany(categories, error => done && done(error, item));
                                    else
                                        done(error, item);
                                });
                        });
                    }
                });
            }
        });
    };
    app.model.fwDraft.userGet = (documentType, editorId, done) => app.model.fwDraft.getAll({ editorId, documentType }, done);
};