import T from 'view/js/common';
T.initPage('pageNews');
T.initPage('pageDraftNews');
T.initPage('homeNewsList');
T.initPage('pageNewsTuyenSinh');

// Reducer ------------------------------------------------------------------------------------------------------------
const NewsGetNewsInPage = 'News:GetNewsInPage';
const NewsGetDraftNewsInPage = 'News:GetDraftNewsInPage';
const NewsGetNews = 'News:GetNews';
const NewsGetDraftNews = 'News:GetDraftNews';

const NewsGetNewsInPageByUser = 'News:GetNewsInPageByUser';
const NewsGetNewsByUser = 'News:GetNewsByUser';
const NewsGetNewsFeed = 'News:GetNewsFeed';

const NewsGetByAdmission = 'News:GetNewsByAdmission';
const NewsGetByNotification = 'News:GetNewsByNotification';
const NewsGetByNews = 'News:GetNewsByNews';
const NewsGetByCategory = 'News:GetNewsByCategory';

export default function newsReducer(state = null, data) {
    switch (data.type) {
        case NewsGetNewsInPage:
            return Object.assign({}, state, { page: data.page, categoryPicker: data.categoryPicker });
        case NewsGetDraftNewsInPage:
            return Object.assign({}, state, { draft: data.page });
        case NewsGetNews:
            return Object.assign({}, state, { news: data.item, categories: data.categories, docDraftUser: data.docDraftUser });
        case NewsGetDraftNews:
            return Object.assign({}, state, { draftNews: data.item, categories: data.categories });

        case NewsGetNewsInPageByUser:
            if (state == null || state.userCondition != data.condition) {
                return Object.assign({}, state, { userCondition: data.condition, userPage: data.page });
            } else {
                const userPage = Object.assign({}, data.page);
                userPage.list = state.userPage && state.userPage.list ? state.userPage.list.slice() : [];
                let ids = userPage.list.map(item => item.id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (ids.indexOf(item.id) == -1) {
                            ids.push(item.id);
                            userPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userPage });
            }

        case NewsGetNewsByUser:
            return Object.assign({}, state, { userNews: data.item });

        case NewsGetNewsFeed:
            return Object.assign({}, state, { newsFeed: data.list });

        case NewsGetByAdmission:
            return { ...state, admission: data.page };

        case NewsGetByNotification: {
            return { ...state, notification: data.page };
        }

        case NewsGetByNews:
            return { ...state, newsCat: data.page };

        case NewsGetByCategory:
            return { ...state, userPage: data.page };

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getNewsInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageNews', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = '/api/news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                dispatch({ type: NewsGetNewsInPage, page: data.page, });
            }
        }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    }
}

export function getNewsDonVi(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageNews', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = '/api/news-donvi/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                // dispatch({ type: NewsGetNewsInPage, page: data.page, });
            }
        }, error => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    }
}

export function getDraftNewsInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDraftNews', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/draft-news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { ...page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem, data.page.pageCondition);
                dispatch({ type: NewsGetDraftNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bản nháp tin tức bị lỗi!', 'danger'));
    }
}

export function getDraftAdmissionNewsInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDraftNews', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/draft-admission/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { ...page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                //if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page);
                //dispatch({ type: NewsGetDraftNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bản nháp tin tức bị lỗi!', 'danger'));
    }
}

export function getUnitDraftNewsInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDraftNews', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/unit-draft-news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { ...page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem, data.page.pageCondition);
                dispatch({ type: NewsGetDraftNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bản nháp tin tức đơn vị bị lỗi!', 'danger'));
    }
}

export function getTranslateDraftNewsInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDraftNews', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/translate-draft-news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { ...page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem, data.page.pageCondition);
                dispatch({ type: NewsGetDraftNewsInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bản nháp tin tức đơn vị bị lỗi!', 'danger'));
    }
}

export function draftToNews(draftNewsId, done) {
    return dispatch => {
        const url = '/api/draft-news/toNews/' + draftNewsId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Thao tác bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                T.notify('Bản nháp đã được duyệt thành công!', 'success');
                done && done();
                dispatch(getDraftNewsInPage());
                dispatch(getNewsInPage());
            }
        }, error => T.notify('Thao tác bị lỗi!', 'danger'));
    }
}

export function createNews(done) {
    return dispatch => {
        const url = '/api/news/default';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo tin tức bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                // dispatch(getNewsInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tin tức bị lỗi!', 'danger'));
    }
}

export function createDraftNewsDefault(done) {
    return (dispatch, getState) => {
        const state = getState();
        const docData = {
            categories: [],
            link: '',
            active: false,
            abstract: JSON.stringify({ vi: '', en: '' }),
            content: JSON.stringify({ vi: '', en: '' }),
        }, passValue = {
            title: JSON.stringify({ vi: 'Bản nháp', en: 'Draft' }),
            editorId: state.system.user.shcc,
            documentType: 'news',
            documentJson: JSON.stringify(docData),
            editorName: state.system.user.lastName + ' ' + state.system.user.firstName,
            isDraftApproved: 1,
        }
        const url = '/api/news/draft';
        T.post(url, passValue, data => {
            if (data.error) {
                T.notify('Tạo bản nháp tin tức bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Bản nháp tin tức đã tạo thành công!', 'success');
                dispatch(getDraftNewsInPage());
                done && done(data);
            }
        })
    }
}

export function createUnitDraftNewsDefault(done) {
    return (dispatch, getState) => {
        const state = getState();
        const docData = {
            categories: [],
            link: '',
            active: false,
            abstract: JSON.stringify({ vi: '', en: '' }),
            content: JSON.stringify({ vi: '', en: '' }),
            maDonVi: state.system.user.maDonVi,
        }, passValue = {
            title: JSON.stringify({ vi: 'Bản nháp đơn vị', en: 'Unit draft' }),
            documentType: 'news',
            documentJson: JSON.stringify(docData),
            editorName: state.system.user.lastName + ' ' + state.system.user.firstName,
            status: 'userCreated'
        };
        if (!state.system.user.maDonVi) T.notify('Bạn chưa được gán với đơn vị!', 'danger');
        else {
            const url = '/api/news/unit/draft';
            T.post(url, passValue, data => {
                if (data.error) {
                    T.notify('Tạo bản nháp tin tức đơn vị bị lỗi!', 'danger');
                    console.error('POST: ' + url + '.', data.error);
                    done && done(data.error);
                } else {
                    T.notify('Bản nháp tin tức đơn vị đã tạo thành công!', 'success');
                    dispatch(getUnitDraftNewsInPage());
                    done && done(data);
                }
            })
        }
    }
}
export function createUnitDraftNewsDean(done) {
    return (dispatch, getState) => {
        const state = getState();
        const docData = {
            categories: [],
            link: '',
            active: false,
            abstract: JSON.stringify({ vi: '', en: '' }),
            content: JSON.stringify({ vi: '', en: '' }),
            maDonVi: state.system.user.maDonVi,
        }, passValue = {
            title: JSON.stringify({ vi: 'Bản nháp đơn vị', en: 'Unit draft' }),
            documentType: 'news',
            documentJson: JSON.stringify(docData),
            editorName: state.system.user.lastName + ' ' + state.system.user.firstName,
            isUnitApproved: 1,
            isDraftApproved: 0,
        }
        if (!state.system.user.maDonVi) T.notify('Bạn chưa được gán với đơn vị!', 'danger');
        else {
            const url = '/api/news/unit/draft';
            T.post(url, passValue, data => {
                if (data.error) {
                    T.notify('Tạo bản nháp tin tức đơn vị bị lỗi!', 'danger');
                    console.error('POST: ' + url + '.', data.error);
                    done && done(data.error);
                } else {
                    T.notify('Bản nháp tin tức đơn vị đã tạo thành công!', 'success');
                    dispatch(getUnitDraftNewsInPage());
                    done && done(data);
                }
            })
        }
    }
}

export function createDraftNews(result, done) {
    return dispatch => {
        const url = '/api/news/draft';
        T.post(url, result, data => {
            if (data.error) {
                T.notify(`Tạo bản nháp tin tức bị lỗi!`, 'danger');
                console.error('POST: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify(`Bản nháp tin tức đã tạo thành công!`, 'success');
                dispatch(getDraftNewsInPage());
                done && done();
            }
            if (done) done(data);
        })
    }
}

export function createUnitDraftNews(result, done) {
    return dispatch => {
        const url = '/api/news/unit/draft';
        T.post(url, result, data => {
            if (data.error) {
                T.notify(`Tạo bản nháp tin tức đơn vị bị lỗi!`, 'danger');
                console.error('POST: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify(`Bản nháp tin tức đơn vị đã tạo thành công!`, 'success');
                dispatch(getUnitDraftNewsInPage());
                done && done();
            }
            if (done) done(data);
        })
    }
}

export function updateNews(id, changes, done) {
    return (dispatch, getState) => {
        const url = '/api/news';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin tin tức thành công!', 'success');
                const news = getState().news;
                if (news && news.categoryPicker)
                    dispatch(getNewsByCategoryAdmin(news.categoryPicker));
                // else
                //     dispatch(getNewsInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin tin tức bị lỗi!', 'danger'));
    }
}

export function swapNews(id, isMoveUp, done) {
    return dispatch => {
        const url = '/api/news/swap';
        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data);
                T.notify('Thay đổi thứ tự tin tức thành công!', 'success');
            }
        }, error => T.notify('Thay đổi thứ tự tin tức bị lỗi!', 'danger'));
    }
}

export function updateDraftNews(id, changes, done) {
    return dispatch => {
        const url = '/api/draft-news';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bản nháp tin tức bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bản nháp tin tức thành công!', 'success');
                dispatch(getDraftNewsInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin bản nháp tin tức bị lỗi!', 'danger'));
    }
}

export function updateUnitDraftNews(id, changes, done) {
    return dispatch => {
        const url = '/api/unit-draft-news';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bản nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bản nháp tin tức đơn vị thành công!', 'success');
                dispatch(getUnitDraftNewsInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin bản nháp tin tức đơn vị bị lỗi!', 'danger'));
    }
}

export function updateTranslateDraftNews(id, changes, done) {
    return dispatch => {
        const url = '/api/translate-draft-news';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bản nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bản nháp tin tức thành công!', 'success');
                dispatch(getTranslateDraftNewsInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin bản nháp tin tức đơn vị bị lỗi!', 'danger'));
    }
}

export function deleteNews(id, done) {
    return dispatch => {
        const url = '/api/news';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa tin tức bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                done && done();
                T.alert('Tin tức được xóa thành công!', 'error', false, 800);
            }
        }, error => T.notify('Xóa tin tức bị lỗi!', 'danger'));
    }
}

export function deleteDraftNews(id) {
    return dispatch => {
        const url = '/api/draft-news';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa mẫu nháp tin tức bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Mẫu nháp tin tức được xóa thành công!', 'error', false, 800);
                dispatch(getDraftNewsInPage());
            }
        }, error => T.notify('Xóa bản nháp tin tức bị lỗi!', 'danger'));
    }
}

export function deleteUnitDraftNews(id) {
    return dispatch => {
        const url = '/api/unit-draft-news';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa mẫu nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Mẫu nháp tin tức đơn vị được xóa thành công!', 'error', false, 800);
                dispatch(getUnitDraftNewsInPage());
            }
        }, error => T.notify('Xóa bản nháp tin tức đơn vị bị lỗi!', 'danger'));
    }
}

export function getNews(id, done) {
    return dispatch => {
        const url = '/api/news/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNews, item: data.item, categories: data.categories });
                done && done(data);
            }
        }, error => done({ error }));
    }
}

export function getDraftNews(id, done) {
    return dispatch => {
        const url = '/api/draft-news/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: NewsGetDraftNews, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    }
}

export function getUnitDraftNews(id, done) {
    return dispatch => {
        const url = '/api/unit-draft-news/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức đơn vị bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: NewsGetDraftNews, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    }
}

export function getTranslateDraftNews(id, done) {
    return dispatch => {
        const url = '/api/translate-draft-news/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: NewsGetDraftNews, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    }
}

export function getNewsByAdmission(pageNumber, pageSize, done) {
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const categoryType = 2;
        const url = `/news/page/${pageNumber}/${pageSize}/${categoryType}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetByAdmission, page: data.page });
                done && done(data.page);
            }
        })
    }
}

export function getNewsByNotification(pageNumber, pageSize, done) {
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const categoryType = 1;
        const url = `/news/page/${pageNumber}/${pageSize}/${categoryType}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetByNotification, page: data.page });
                done && done(data.page);
            }
        })
    }
}

export function getNewsByNews(pageNumber, pageSize, done) {
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const categoryType = 3;
        const url = `/news/page/${pageNumber}/${pageSize}/${categoryType}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify('Lấy danh sách tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetByNews, page: data.page });
                done && done(data.page);
            }
        })
    }
}
// Actions (user) -----------------------------------------------------------------------------------------------------
const texts = {
    vi: {
        getNewsInPageByUserError: 'Lấy danh sách tin tức bị lỗi!',
        getNewsByUserError: 'Lấy tin tức bị lỗi!',
        getNewsFeedError: 'Lấy new feed bị lỗi!',
    },
    en: {
        getNewsInPageByUserError: 'Errors when get news list!',
        getNewsByUserError: 'Errors when get one news!',
        getNewsFeedError: 'Errors when get news feed!',
    }
};
const language = T.language(texts);

export function getNewsInPageByUser(pageNumber, pageSize) {
    return dispatch => {
        const page = T.updatePage('homeNewsList', pageNumber, pageSize);
        const url = '/news/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsInPageByUser, page: data.page });
            }
        }, error => T.notify(language.getNewsInPageByUserError, 'danger'));
    }
}

export function getNewsByCategoryAdmin(category, pageNumber, pageSize, done) {
    const page = T.updatePage('pageNewsTuyenSinh', pageNumber, pageSize);
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const url = `/api/news-category/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { category }, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
            }
        }, error => T.notify(language.getNewsInPageByUserError, 'danger'));
    }
}
export function getNewsByCategoriId(category, pageNumber, pageSize, done) {
    const page = T.updatePage('homeNewsList', pageNumber, pageSize);
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const url = `/news/page/${page.pageNumber}/${page.pageSize}/${category}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsInPage, page: data.page, categoryPicker: category });
                done && done(data.page);
            }
        }, error => T.notify(language.getNewsInPageByUserError, 'danger'));
    }
}

export function getNewsByCategory(pageNumber, pageSize, category, done) {
    const page = T.updatePage('homeNewsList', pageNumber, pageSize);
    return dispatch => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const url = `/news/page/${page.pageNumber}/${page.pageSize}/${category}`;
        T.get(url, {}, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
            }
        }, error => T.notify(language.getNewsInPageByUserError, 'danger'));
    }
}

export function getNewsByUser(newsId, newsLink, done) {
    return dispatch => {
        const url = newsId ? '/news/item/id/' + newsId : '/news/item/link/' + newsLink;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsByUser, item: data.item });
                done && done(data);
            }
        }, error => T.notify(language.getNewsByUserError, 'danger'));
    }
}

export function getNewsFeed(maDonVi) {
    return dispatch => {
        const url = '/news/page/1/' + T.newsFeedPageSize
        T.get(url, { maDonVi }, data => {
            if (data.error) {
                T.notify(language.getNewsFeedError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NewsGetNewsFeed, list: data.page.list });
            }
        }, error => T.notify(language.getNewsFeedError, 'danger'));
    }
}
export function getNewsFeedByCategory(type) {
    return dispatch => {
        const url = `/news/page/1/20/${type}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsFeedError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                let list = [...data.page.list];
                if (list.length > 10) list = list.slice(0, 10);
                dispatch({ type: NewsGetNewsFeed, list: list });
            }
        }, error => T.notify(language.getNewsFeedError, 'danger'));
    }
}

export function checkLink(id, link, done) {
    return dispatch => {
        const url = '/news/item/check-link';
        T.put(url, { id, link }, data => {
            if (data.error) {
                T.notify('Link không hợp lệ!', 'danger');
                console.error('PUT: ' + url + '.', error);
            } else {
                T.notify('Link hợp lệ!', 'success');
            }
            done && done(data);
        }, error => T.notify('Kiểm tra Link bị lỗi!', 'danger'));
    }
}
export function adminCheckLink(id, link, done) {
    return dispatch => {
        const url = '/news/item/check-link';
        T.put(url, { id, link }, data => {
            done && done(data);
        }, error => T.notify('Kiểm tra Link bị lỗi!', 'danger'));
    }
}

export const ajaxSelectNews = {
    url: '/api/news/page/1/20',
    data: params => ({ condition: params.term }),
    processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: JSON.stringify(item), text: T.language.parse(item.title) })) : [] })
}
