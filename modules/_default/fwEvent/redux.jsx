import T from 'view/js/common';

T.initPage('pageEvent');
T.initPage('pageDraftEvent');
T.initPage('homeEventList');
T.initPage('pageEventTuyenSinh');

// Reducer -------------------------------------------------------------------------------------------------------------
const EventGetPage = 'Event:GetPage';
const EventGetDraftPage = 'Event:GetDraftPage';
const EventGet = 'Event:Get';
const EventGetDraft = 'Event:GetDraft';
const EventFeed = 'Event:Feed';
const GET_EVENT_IN_PAGE_BY_USER = 'Event:GetEventPageByUser';
const GET_EVENT_BY_USER = 'Event:GetEventByUser';

export default function eventReducer(state = null, data) {
    switch (data.type) {
        case EventGetPage:
            return Object.assign({}, state, { page: data.page });
        case EventGetDraftPage:
            return Object.assign({}, state, { draft: data.page });
        case EventGet:
            return Object.assign({}, state, { event: data.item, categories: data.categories, docDraftUser: data.docDraftUser });
        case EventGetDraft:
            return Object.assign({}, state, { draftEvent: data.item, categories: data.categories });
        case GET_EVENT_IN_PAGE_BY_USER:
            if (state == null || state.userCondition != data.condition) {
                return Object.assign({}, state, { userCondition: data.condition, userPage: data.page });
            } else {
                const userPage = Object.assign({}, data.page);
                userPage.list = state.userPage && state.userPage.list ? state.userPage.list.slice() : [];
                let _ids = userPage.list.map(item => item.id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (_ids.indexOf(item.id) == -1) {
                            _ids.push(item.id);
                            userPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userPage });
            }

        case GET_EVENT_BY_USER:
            return Object.assign({}, state, { userEvent: data.item });

        case EventFeed:
            return Object.assign({}, state, { newsFeed: data.list });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function getEventInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageEvent', pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = '/api/event/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition: page.pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (page.pageCondition) data.page.pageCondition = page.pageCondition;
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EventGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger'));
    };
}

export function getEventByCategoryAdmin(category, pageNumber, pageSize, done) {
    // const page = T.updatePage('pageEventTuyenSinh', pageNumber, pageSize);
    return () => {
        if (typeof (pageNumber) == 'function') {
            done = pageNumber;
            pageNumber = null;
            pageSize = null;
        }
        if (!pageNumber) pageNumber = 1;
        if (!pageSize) pageSize = 25;
        const url = `/api/event-category/page/${pageNumber}/${pageSize}`;
        T.get(url, { category }, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
            }
        }, () => T.notify(language.getNewsInPageByUserError, 'danger'));
    };
}
export function getDraftEventInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDraftEvent', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/draft-event/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bản nháp sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EventGetDraftPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
    };
}
export function draftToEvent(draftEventId,) {
    return dispatch => {
        const url = '/api/draft-event/toEvent/' + draftEventId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Thao tác bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                T.notify('Bản nháp đã được duyệt thành công!', 'success');
                dispatch(getDraftEventInPage());
                dispatch(getEventInPage());
            }
        }, () => T.notify('Thao tác bị lỗi bị lỗi!', 'danger'));
    };
}

export function createEvent(done) {
    return dispatch => {
        const url = '/api/event/default';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo sự kiện bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getEventInPage());
                if (done) done(data);
            }
        }, () => T.notify('Tạo sự kiện bị lỗi!', 'danger'));
    };
}
export function createDraftEventDefault(done) {
    return (dispatch, getState) => {
        const state = getState();
        const docData = {
            categories: [],
            link: '',
            active: false,
            abstract: JSON.stringify({ vi: '', en: '' }),
            content: JSON.stringify({ vi: '', en: '' }),
            maxRegisterUsers: -1,
        }, passValue = {
            title: JSON.stringify({ vi: 'Bản nháp', en: 'Draft' }),
            editorId: state.system.user.shcc,
            documentType: 'event',
            action: 'create',
            documentJson: JSON.stringify(docData),
            editorName: 'Test',
        };
        if (state.system.user.permissions.includes('event:write')) {
            delete passValue.editorId;
            delete passValue.editorName;
        }
        const url = '/api/event/draft';
        T.post(url, passValue, data => {
            if (data.error) {
                T.notify('Tạo bản nháp sự kiện bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                // T.notify('Bản nháp sự kiện đã tạo thành công!', 'success');	
                dispatch(getDraftEventInPage());
                done && done(data);
            }
        });
    };
}
export function createDraftEvent(result, done) {
    return dispatch => {
        const url = '/api/event/draft';
        T.post(url, result, data => {
            if (data.error) {
                T.notify('Tạo bản nháp sự kiện bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Bản nháp sự kiện đã tạo thành công!', 'success');
                dispatch(getDraftEventInPage());
                done && done();
            }
            if (done) done(data);
        });
    };
}

export function updateEvent(id, changes, done) {
    return dispatch => {
        const url = '/api/event';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin sự kiện bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin sự kiện thành công!', 'success');
                dispatch(getEventInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin sự kiện bị lỗi!', 'danger'));
    };
}

export function updateDraftEvent(id, changes, done) {
    return dispatch => {
        const url = '/api/draft-event';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bản nháp sự kiện bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bản nháp sự kiện thành công!', 'success');
                dispatch(getDraftEventInPage());
                done && done();
            }
        }, () => T.notify('Cập nhật thông tin bản nháp sự kiện bị lỗi!', 'danger'));
    };
}

export function swapEvent(id, isMoveUp) {
    return dispatch => {
        const url = '/api/event/swap';
        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự sự kiện bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự sự kiện thành công!', 'success');
                dispatch(getEventInPage());
            }
        }, () => T.notify('Thay đổi thứ tự sự kiện bị lỗi!', 'danger'));
    };
}

export function deleteEvent(id) {
    return dispatch => {
        const url = '/api/event';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa sự kiện bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Sự kiện được xóa thành công!', 'error', false, 800);
                dispatch(getEventInPage());
            }
        }, () => T.notify('Xóa sự kiện bị lỗi!', 'danger'));
    };
}

export function deleteDraftEvent(id) {
    return dispatch => {
        const url = '/api/draft-event';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa mẫu sự kiện bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Người dùng được xóa thành công!', 'error', false, 800);
                dispatch(getDraftEventInPage());
            }
        }, () => T.notify('Xóa sự kiện bị lỗi!', 'danger'));
    };
}

export function getEvent(id, done) {
    return (dispatch, getState) => {
        const url = '/api/event/item/' + id;
        const state = getState();
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                const url2 = '/api/draft/event/' + state.system.user.id;
                T.get(url2, draft => {
                    if (done) done(data);
                    dispatch({ type: EventGet, item: data.item, categories: data.categories, docDraftUser: draft });
                }, () => T.notify('Lấy danh sách tin tức bị lỗi!', 'danger'));
            }
        }, error => done({ error }));
    };
}
export function getDraftEvent(id, done) {
    return dispatch => {
        const url = '/api/draft-event/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: EventGetDraft, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    };
}

export function getEventWithQuestion(id, done) {
    return dispatch => {
        const url = '/api/event/item-question/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: EventGet, item: data.item, categories: data.categories });
                if (done) done(data);
            }
        }, error => done({ error }));
    };
}

// Actions (editor) ---------------------------------------------------------------------------------------------------
export function getEventInPageByEditor(pageNumber, pageSize, done) {
    const page = T.updatePage('pageEvent', pageNumber, pageSize);
    return dispatch => {
        const url = '/editor/event/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EventGetPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger'));
    };
}

export function getDraftEventInPageByEditor(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDraftEvent', pageNumber, pageSize);
    return dispatch => {
        const url = '/editor/draft/event/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EventGetDraftPage, page: data.page });
            }
        }, () => T.notify('Lấy danh sách sự kiện bị lỗi!', 'danger'));
    };
}

export function getEventByEditor(id, done) {
    return dispatch => {
        const url = '/editor/event/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: EventGet, item: data.item, categories: data.categories });
            }
        }, error => done({ error }));
    };
}

export function swapEventByEditor(id, isMoveUp) {
    return dispatch => {
        const url = '/editor/event/swap/';
        T.put(url, { id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự sự kiện bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự sự kiện thành công!', 'success');
                dispatch(getEventInPageByEditor());
            }
        }, () => T.notify('Thay đổi thứ tự sự kiện bị lỗi!', 'danger'));
    };
}

export function changeEventActiveByEditor(id, active) {
    return dispatch => {
        const url = '/editor/event/active/';
        T.put(url, { id, active }, data => {
            if (data.error) {
                T.notify('Thay đổi trạng thái sự kiện bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi trạng thái sự kiện thành công!', 'success');
                dispatch(getEventInPageByEditor());
            }
        }, () => T.notify('Thay đổi trạng thái sự kiện bị lỗi!', 'danger'));
    };
}

// Actions (user) -----------------------------------------------------------------------------------------------------
const texts = {
    vi: {
        getNewsInPageByUserError: 'Lấy danh sách sự kiện bị lỗi!',
        getNewsByUserError: 'Lấy sự kiện bị lỗi!',
        getNewsFeedError: 'Lấy event feed bị lỗi!',
    },
    en: {
        getNewsInPageByUserError: 'Errors when get events list!',
        getNewsByUserError: 'Errors when get one event!',
        getNewsFeedError: 'Errors when get events feed!',
    }
};
const language = T.language(texts);


export function getEventInPageByUser(pageNumber, pageSize, done) {
    const page = T.updatePage('homeEventList', pageNumber, pageSize);
    return () => {
        const url = '/event/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                // dispatch({ type: GET_EVENT_IN_PAGE_BY_USER, page: data.page });
            }
        }, () => T.notify(language.getNewsInPageByUserError, 'danger'));
    };
}
export function getEventInPageByCategory(pageNumber, pageSize, category, done) {
    return () => {
        const url = `/event/page/${pageNumber}/${pageSize}/${category}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsInPageByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, () => T.notify(language.getNewsInPageByUserError, 'danger'));
    };
}

export function getEventByUser(eventId, eventLink, done) {
    return dispatch => {
        const url = eventId ? '/event/item/id/' + eventId : '/event/item/link/' + eventLink;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsByUserError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET_EVENT_BY_USER, item: data.item });
                done && done(data);
            }
        }, () => T.notify(language.getNewsByUserError, 'danger'));
    };
}

export function getEventFeed() {
    return dispatch => {
        const url = '/event/page/1/' + T.eventFeedPageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getNewsFeedError, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: EventFeed, list: data.page.list });
            }
        }, () => T.notify(language.getNewsFeedError, 'danger'));
    };
}

export function checkLink(id, link) {
    return () => {
        const url = '/event/item/check-link';
        T.put(url, { id, link }, data => {
            if (data.error) {
                T.notify('Link không hợp lệ!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Link hợp lệ!', 'success');
            }
        }, () => T.notify('Kiểm tra Link bị lỗi!', 'danger'));
    };
}

//Question
export function getEventWithQuestionByUser(id, link, done) {
    return dispatch => {
        const url = id ? `/event/item-question/id/${id}` : `/event/item-question/link/${link}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: GET_EVENT_BY_USER, item: data.item });
            }
        }, error => done({ error }));
    };
}