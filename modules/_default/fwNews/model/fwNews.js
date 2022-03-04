const keys = ['ID'];
const obj2Db = { 'priority': 'PRIORITY', 'title': 'TITLE', 'image': 'IMAGE', 'link': 'LINK', 'active': 'ACTIVE', 'isInternal': 'IS_INTERNAL', 'abstract': 'ABSTRACT', 'content': 'CONTENT', 'createdDate': 'CREATED_DATE', 'startPost': 'START_POST', 'stopPost': 'STOP_POST', 'id': 'ID', 'views': 'VIEWS', 'maDonVi': 'MA_DON_VI', 'isTranslate': 'IS_TRANSLATE', 'language': 'LANGUAGE', 'attachment': 'ATTACHMENT', 'displayCover': 'DISPLAY_COVER', 'pinned': 'PINNED', 'linkEn': 'LINK_EN' };
const obj2DbFilter = { 'priority': 'PRIORITY', 'title': 'TITLE', 'image': 'IMAGE', 'link': 'LINK', 'active': 'ACTIVE', 'isInternal': 'IS_INTERNAL', 'abstract': 'ABSTRACT', 'createdDate': 'CREATED_DATE', 'startPost': 'START_POST', 'stopPost': 'STOP_POST', 'id': 'ID', 'views': 'VIEWS', 'maDonVi': 'MA_DON_VI', 'isTranslate': 'IS_TRANSLATE', 'language': 'LANGUAGE', 'attachment': 'ATTACHMENT', 'displayCover': 'DISPLAY_COVER', 'pinned': 'PINNED', 'linkEn': 'LINK_EN' };

module.exports = app => {
    app.model.fwNews.create2 = (data, done) => {
        app.model.fwNews.get({}, '*', 'priority DESC', (error, news) => {
            data.priority = error || news == null ? 1 : news.priority + 1;

            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done('Data is empty!');
            } else {
                const sql = 'INSERT INTO FW_NEWS (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.fwNews.get({ rowId: resultSet.lastRowid }, (error, news) => {
                            if (error) {
                                done(error);
                            } else {
                                // if (app.data && app.data.numberOfNews) app.data.numberOfNews++;
                                const image = '/img/news/' + news.id + '.jpg';
                                const srcPath = app.path.join(app.publicPath, '/img/avatar.png'),
                                    destPath = app.path.join(app.publicPath, image);
                                app.fs.copyFile(srcPath, destPath, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        app.model.fwNews.update({ rowId: resultSet.lastRowid }, { image }, done);
                                    }
                                });
                            }
                        });
                    } else {
                        done(error);
                    }
                });
            }
        });
    };

    app.model.fwNews.delete2 = (condition, done) => {
        app.model.fwNews.get(condition, (error, news) => {
            if (error || news === null) {
                done(error);
            } else {
                app.model.fwNewsCategory.getAll({ newsId: news.id }, (error, items) => {
                    if (error) {
                        done(error);
                    } else if (!items || !items.length) {
                        app.model.fwDraft.delete2({ documentId: news.id }, error => {
                            if (error) {
                                done(error);
                            } else {
                                // if (app.data && app.data.numberOfNews) app.data.numberOfNews--;
                                app.deleteImage(news.image);
                                app.model.fwNews.delete(condition, done);
                            }
                        });
                    } else {
                        app.model.fwNewsCategory.delete({ newsId: news.id }, error => {
                            if (error) {
                                done(error);
                            } else {
                                app.model.fwDraft.delete2({ documentId: news.id }, error => {
                                    if (error) {
                                        done(error);
                                    } else {
                                        // if (app.data && app.data.numberOfNews) app.data.numberOfNews--;
                                        app.deleteImage(news.image);
                                        app.model.fwNews.delete(condition, done);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    };

    app.model.fwNews.readById = (id, done) => app.model.fwNews.read({ id, active: 1 }, done);

    app.model.fwNews.getByLink = (link, done) => app.model.fwNews.get({ link }, done);

    app.model.fwNews.getByEnLink = (linkEn, done) => app.model.fwNews.get({ linkEn }, done);

    app.model.fwNews.readByLink = (link, done) => app.model.fwNews.read({ link, active: 1 }, done);

    app.model.fwNews.readByEnLink = (linkEn, done) => app.model.fwNews.read({ linkEn, active: 1 }, done);

    app.model.fwNews.read = (condition, done) => {
        app.model.fwNews.getAll(condition, (error, items) => {
            if (error) {
                done(error);
            } else if (items == null || items.length != 1) {
                done('Invalid Id!');
            } else {
                const views = ++items[0].views;
                app.model.fwNews.update(condition, { views }, (error, item) => {
                    app.io.emit('news:item-view-changed', item.id, item.views);
                    done(error, item);
                });
            }
        });
    };

    app.model.fwNews.swapPriority = (id, isMoveUp, done) => {
        app.model.fwNews.get({ id }, (error, item1) => {
            if (error || item1 === null) {
                done('Invalid news Id!');
            } else {
                const operator = isMoveUp ? '>' : '<';
                const order = isMoveUp ? '' : ' DESC';
                const sql = `SELECT PRIORITY AS "priority", ID as "id" FROM (
                                SELECT t.*
                                FROM HCMUSSH.FW_NEWS t
                                ORDER BY PRIORITY${order}
                            ) WHERE PRIORITY ${operator} :priority AND ROWNUM <= :limit`;
                app.dbConnection.execute(sql, { priority: item1.priority, limit: 1 }, (error, { rows }) => {
                    if (error) {
                        done(error);
                    } else if (rows === null || rows.length === 0) {
                        done(null);
                    } else {
                        let item2 = rows[0],
                            { priority } = item1;
                        item1.priority = item2.priority;
                        item2.priority = priority;
                        app.model.fwNews.update({ id: item1.id }, { priority: item1.priority }, error1 => {
                            app.model.fwNews.update({ id: item2.id }, { priority: item2.priority }, error2 => done(error1 || error2));
                        });
                    }
                });
            }
        });
    };

    app.model.fwNews.getNewsPageWithCategory = (category, pageNumber, pageSize, condition, selectedColumns, orderBy, done) => {
        if (typeof condition == 'function') {
            done = condition;
            condition = {};
            selectedColumns = '*';
        } else if (selectedColumns && typeof selectedColumns == 'function') {
            done = selectedColumns;
            selectedColumns = '*';
        }

        if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
        condition = app.dbConnection.buildCondition(obj2Db, condition, ' AND ');
        let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
            parameter = condition.parameter ? condition.parameter : {};
        const sql_count = `SELECT COUNT(DISTINCT ID)
                            FROM (SELECT FN.*, FC.ID AS CATEGORY_ID, FC.TITLE AS CATEGORY_TITLE
                                FROM FW_NEWS FN
                                    INNER JOIN FW_NEWS_CATEGORY FNC on FN.ID = FNC.NEWS_ID
                                    INNER JOIN FW_CATEGORY FC on FNC.CATEGORY_ID = FC.ID)
                                WHERE CATEGORY_ID IN(` + category + ')' + (condition.statement ? ' AND ' + condition.statement.replace('FN.ACTIVE', 'ACTIVE') : '');
        app.dbConnection.execute(sql_count, parameter, (err, res) => {
            let result = {};
            let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(DISTINCTID)'] : 0;
            result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
            result.pageNumber = pageNumber === -1 ? 1 : Math.min(pageNumber, result.pageTotal);
            leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
            const sql = 'SELECT DISTINCT ID,' + app.dbConnection.parseSelectedColumns(obj2DbFilter, selectedColumns) + 'FROM (SELECT FN.*, COUNT(*) over (partition by FN.ID) AS CNT, FC.ID AS CATEGORY_ID, FC.TITLE AS CATEGORY_TITLE, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : ' FN.' + keys) + ') R FROM FW_NEWS FN INNER JOIN FW_NEWS_CATEGORY FNC on FN.ID = FNC.NEWS_ID INNER JOIN FW_CATEGORY FC on FNC.CATEGORY_ID = FC.ID WHERE CATEGORY_ID IN ('
                + category + ')' + (condition.statement ? ' AND ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize) + ' ORDER BY pinned DESC, START_POST DESC';
            app.dbConnection.execute(sql, parameter, (error, resultSet) => {
                result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                done(error, result);
            });
        });
    };

};