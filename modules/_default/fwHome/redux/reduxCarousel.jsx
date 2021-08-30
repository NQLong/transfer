import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CarouselGetAll = 'Carousel:GetAll';
const CarouselGetPage = 'Carousel:GetPage';
const CarouselGet = 'Carousel:Get';
const CarouselUpdate = 'Carousel:Update';

export default function carouselReducer(state = null, data) {
    switch (data.type) {
        case CarouselGetAll:
            return Object.assign({}, state, { items: data.items });

        case CarouselGetPage:
            return Object.assign({}, state, { page: data.page });

        case CarouselGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case CarouselUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem.carouselId == updatedItem.carouselId) {
                for (let i = 0, items = state.selectedItem.items, n = items.length; i < n; i++) {
                    if (items[i].carouselId = updatedItem.carouselId) {
                        state.selectedItem.items.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return state;

        default:
            return state;
    }
}

// Action --------------------------------------------------------------------------------------------------------------
export function getAllCarousels(done) {
    return dispatch => {
        const url = '/api/carousel/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tập hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: CarouselGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Lấy danh sách tập hình ảnh bị lỗi!', 'danger'));
    }
}

T.initPage('adminCarousel');
export function getCarouselInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('adminCarousel', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/carousel/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CarouselGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách hình ảnh bị lỗi!', 'danger'));
    }
}

export function getCarousel(id, done) {
    return dispatch => {
        const url = '/api/carousel/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin tập hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: CarouselGet, item: data.item });
            }
        }, error => T.notify('Lấy thông tin tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function createCarousel(data, done) {
    return dispatch => {
        const url = '/api/carousel';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo tập hình ảnh bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarouselInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function updateCarousel(id, changes, done) {
    return dispatch => {
        const url = '/api/carousel';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật tập hình ảnh bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Tập hình ảnh cập nhật thành công!', 'success');
                dispatch(getCarouselInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function deleteCarousel(id) {
    return dispatch => {
        const url = '/api/carousel';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa tập hình ảnh bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Tập hình ảnh đã xóa thành công!', 'error', false, 800);
                dispatch(getCarouselInPage());
            }
        }, error => T.notify('Xóa hình ảnh bị lỗi!', 'danger'));
    }
}

export function createCarouselItem(data, done) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Tạo hình ảnh bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + res.error);
            } else {
                dispatch(getCarousel(data.carouselId));
                if (done) done(res);
            }
        }, error => T.notify('Tạo hình ảnh bị lỗi!', 'danger'));
    }
}

export function updateCarouselItem(carouselId, priority, changes, done) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.put(url, { carouselId, priority, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hình ảnh bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật hình ảnh thành công!', 'info');
                dispatch(getCarousel(carouselId));
                if (done) done();
            }
        }, error => T.notify('Cập nhật hình ảnh bị lỗi!', 'danger'));
    }
}

export function swapCarouselItem(carouselId, priority, isMoveUp) {
    return dispatch => {
        const url = '/api/carousel/item/swap';
        T.put(url, { carouselId, priority, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí hình ảnh bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarousel(carouselId));
            }
        }, error => T.notify('Thay đổi vị trí hình ảnh bị lỗi!', 'danger'));
    }
}

export function deleteCarouselItem(carouselId, priority) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.delete(url, { carouselId, priority }, data => {
            if (data.error) {
                T.notify('Xóa hình ảnh bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Hình ảnh được xóa thành công!', 'error', false, 800);
                dispatch(getCarousel(carouselId));
            }
        }, error => T.notify('Xóa hình ảnh bị lỗi!', 'danger'));
    }
}

export function moveCarouselItem(carouselId, oldPriority, newPriority) {
    return dispatch => {
        const url = `/api/carousel/item/priority`
        T.put(url, { carouselId, oldPriority, newPriority }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí hình ảnh bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Thay đổi vị trí hình ảnh bị thành công!', 'info');
                dispatch(getCarousel(carouselId));
            }
        }, error => T.notify('Thay đổi vị trí hình ảnh bị lỗi!', 'danger'));
    }
}

export function changeCarouselItem(item) {
    return { type: CarouselUpdate, item };
}


// Home -------------------------------------------------------------------------------------------
export function homeGetCarousel(id, done) {
    return dispatch => {
        const url = '/home/carousel/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}
