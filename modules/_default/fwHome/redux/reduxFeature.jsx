import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FeatureGetAll = 'Feature:GetAll';
const FeatureGet = 'Feature:Get';
const FeatureUpdate = 'Feature:Update';
const FeatureAddItem = 'Feature:AddItem';
const FeatureUpdateItem = 'Feature:UpdateItem';
const FeatureRemoveItem = 'Feature:RemoveItem';
const FeatureSwapItems = 'Feature:SwapItems';

const FeatureItemGetAll = 'FeatureItem:GetAll';

export default function featureReducer(state = { feature: null, featureItem: null }, data) {
    switch (data.type) {
        case FeatureGetAll:
            return { ...state, feature: { list: data.items } };

        case FeatureGet:
            return { ...state, feature: { item: data.item } };

        case FeatureItemGetAll:
            return { ...state, featureItem: { list: data.items } };

        case FeatureSwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                const feature = state.item.items[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index - 1, 0, feature);
                } else if (!data.isMoveUp && data.index < state.item.items.length - 1) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index + 1, 0, feature);
                }
            }
            return state;

        case FeatureUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllFeatures(done) {
    return dispatch => {
        const url = '/api/feature/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách feature bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: FeatureGetAll, items: data.items });
            }
        }, error => T.notify('Lấy danh sách feature bị lỗi!', 'danger'));
    };
}

export function getFeatureById(id, done) {
    return dispatch => {
        const url = '/api/feature/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy feature bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch({ type: FeatureGet, item: data.item });
            }
        }, error => T.notify('Lấy feature bị lỗi!', 'danger'));
    };
}

export function createFeature(payload, done) {
    return dispatch => {
        const url = '/api/feature';
        T.post(url, payload, data => {
            if (data.error) {
                T.notify('Tạo feature bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllFeatures());
                if (done) done(data);
            }
        }, error => T.notify('Tạo feature bị lỗi!', 'danger'));
    };
}

export function updateFeature(id, changes, done) {
    return dispatch => {
        const url = '/api/feature';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin feature bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin feature thành công!', 'success');
                dispatch(getAllFeatures());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin feature bị lỗi!', 'danger'));
    };
}

export function deleteFeature(item) {
    return dispatch => {
        const url = '/api/feature';
        T.get('/api/featureItem/all/' + item.id, data => {
            if (data.items) {
                for (const item of data.items) {
                    T.delete('/api/featureItem', { item });
                }
            }
            T.delete(url, { item }, data => {
                if (data.error) {
                    T.notify('Xóa feature bị lỗi!', 'danger');
                    console.error('DELETE: ' + url + '. ' + data.error);
                } else {
                    T.alert('Feature được xóa thành công!', 'error', false, 800);
                    dispatch(getAllFeatures());
                }
            }, error => T.notify('Xóa feature bị lỗi!', 'danger'));
        });

    };
}

export function getFeatureItem(featureId, done) {
    return dispatch => {
        const url = '/api/featureItem/all/' + featureId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy feature item bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ items: data.items });
                dispatch({ type: FeatureItemGetAll, items: data.items });
            }
        }, error => T.notify('Lấy feature item bị lỗi!', 'danger'));
    };
}

export function createFeatureItem(image, content, featureId, link, done) {
    return dispatch => {
        const url = '/api/featureItem';
        T.post(url, { image, content, featureId, link }, data => {
            if (data.error) {
                T.notify('Tạo feature item bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done();
                dispatch(getFeatureItem(featureId));
            }
        }, error => T.notify('Tạo feature item bị lỗi!', 'danger'));
    };
}

export function updateFeatureItem(id, featureId, changes, done) {
    return dispatch => {
        const url = '/api/featureItem';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật feature item bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                if (done) done();
                dispatch(getFeatureItem(featureId));
            }
        }, error => T.notify('Cập nhật feature item bị lỗi!', 'danger'));
    };
}

export function deleteFeatureItem(item, done) {
    return dispatch => {
        const url = '/api/featureItem';
        T.delete(url, { item }, data => {
            if (data.error) {
                T.notify('Xoá feature item bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                if (done) done();
                dispatch(getFeatureItem(item.featureId));
            }
        }, error => T.notify('Xoá feature item bị lỗi!', 'danger'));
    };
}

export function getFeatureByUser(id, done) {
    return dispatch => {
        const url = '/home/feature/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy feature bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify('Lấy feature bị lỗi!', 'danger'));
    };
}

export function getFeatureItemByUser(featureId, done) {
    return dispatch => {
        const url = '/home/featureItem/' + featureId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy feature item bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => T.notify('Lấy feature item bị lỗi!', 'danger'));
    };
}