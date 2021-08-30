import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_ANSWERS_IN_PAGE = 'answer:getAnswersInPage';
const UPDATE_ITEM = 'answer:updateAnswer';
const UPDATE_TEMPLATE_ANSWER = 'answer:updateTemplateAnswer';
const CLEAR_TEMPLATE_ANSWER = 'answer:clearTemplateAnswer';

export default function answerReducer(state = { templateAnswer: [] }, data) {
    switch (data.type) {
        case GET_ANSWERS_IN_PAGE:
            return Object.assign({}, state, { page: data.page });

        case UPDATE_ITEM: {
            let page = state && state.page ? state.page : { list: [] }, list = page.list;
            let i = 0;
            for (i; i < list.length; i++) {
                if (list[i].id == data.item.id) {
                    break;
                }
            }
            list.splice(i, 1, data.item);
            page.list = list;
            return Object.assign({}, state, { page });
        }

        case UPDATE_TEMPLATE_ANSWER:
            return Object.assign({}, state, { templateAnswer: data.templateAnswer });

        case CLEAR_TEMPLATE_ANSWER:
            return Object.assign({}, state, { templateAnswer: [] });

        default:
            return state;
    }
}

T.initPage('pageAnswer');
export function getAnswerInPage(eventId, formId, pageNumber, pageSize, done) {
    const page = T.updatePage('pageAnswer', pageNumber, pageSize);
    return dispatch => {
        if (!eventId) {
            done && done({});
            dispatch({ type: GET_ANSWERS_IN_PAGE, page: {} });
        } else {
            const url = `/api/answer/page/${eventId}/${formId}/${page.pageNumber}/${page.pageSize}`;
            T.get(url, data => {
                if (data.error) {
                    T.notify('Lấy danh sách câu trả lời bị lỗi!', 'danger');
                    console.error('GET: ' + url + '.', data.error);
                } else {
                    done && done(data.page);
                    dispatch({ type: GET_ANSWERS_IN_PAGE, page: data.page });
                }
            }, () => T.notify('Lấy danh sách câu trả lời bị lỗi!', 'danger'));
        }
    }
}

export function getAnswer(id, done) {
    return dispatch => {
        const url = `/api/answer/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy câu trả lời bị lỗi', 'danger');
            } else {
                done && done(data.item);
            }
        }, () => T.notify('Lấy câu trả lời bị lỗi', 'danger'));
    }
}

export function searchUserFromSystem(email, done) {
    return dispatch => {
        const url = `/api/user-search/${email}`;
        T.get(url, data => {
            done && done(data);
        }, () => done && done({ error: true }));
    }
}

export function addAnswer(newData, eventId, formId, done) {
    return dispatch => {
        const url = '/api/answer';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Thêm câu trả lời bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.exist) {
                T.notify('Người dùng đã có trong danh sách đăng ký!', 'warning');
            } else {
                dispatch(getAnswerInPage(eventId, formId));
                done && done(data.item);
            }
        }, error => T.notify('Thêm câu trả lời bị lỗi!', 'danger'));
    }
}

export function updateAnswer(id, changes, done) {
    return dispatch => {
        const url = '/api/answer';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật câu trả lời bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data.item);
                dispatch({ type: UPDATE_ITEM, item: data.item });
            }
        }, () => T.notify('Cập nhật câu trả lời bị lỗi!', 'danger'));
    }
}

export function deleteAnswer(id, eventId, formId, done) {
    return dispatch => {
        const url = '/api/answer';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá câu trả lời bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xoá câu trả lời thành công!', 'success', false, 1000);
                done && done();
                dispatch(getAnswerInPage(eventId, formId));
            }
        }, error => T.alert('Xoá câu trả lời bị lỗi!', 'error'));
    }
}

export function deleteManyAnswerByAdmin(postId, done) {
    const url = '/api/answer/post/' + postId;
    T.delete(url, data => {
        if (data.error) {
            T.notify('Xoá câu trả lời bị lỗi!', 'danger');
            console.error('DELETE: ' + url + '.', data.error);
        } else {
            if (done) done(data);
            T.notify('Xoá câu trả lời thành công!', 'success');
        }
    }, error => T.notify('Xoá câu trả lời bị lỗi!', 'danger'));
}

// Actions (user) -----------------------------------------------------------------------------------------------------
export function addAnswerByUser(newData, done) {
    return dispatch => {
        const url = `/api/home/answer`;
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.exist) {
                T.notify('Bạn đã hoàn thành bài thi này!', 'warning');
            } else {
                done && done();
                dispatch({ type: CLEAR_TEMPLATE_ANSWER });
            }
        }, error => T.notify('Nộp bài thi bị lỗi!', 'danger'));
    }
}

export function countAnswer(eventId, formId, done) {
    return dispatch => {
        const url = `/api/answer/count/${eventId}/${formId}`;
        T.get(url, data => {
            if (data.error) {
                console.error('GET: ' + url + ' has error!');
            } else {
                done && done(data.total);
            }
        }, () => console.error('GET: ' + url + ' has error!'));
    }
}

export function clearParticipantsSession() {
    return dispatch => {
        const url = '/api/answer/clear-participants-session';
        T.delete(url);
    }
}

export function checkHasAnswered(formId, eventId, done) {
    return dispatch => {
        const url = '/api/answer/check';
        T.post(url, { formId, eventId }, data => {
            if (data.error) {
                done && done(data);
            } else {
                done && done(data);
            }
        })
    }
}
