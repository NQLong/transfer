import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TccbDanhGiaFormChuyenVienGetAll = 'TccbDanhGiaFormChuyenVien:GetAll';
const TccbDanhGiaFormChuyenVienUpdate = 'TccbDanhGiaFormChuyenVien:Update';

export default function TccbDanhGiaFormChuyenVienReducer(state = null, data) {
    switch (data.type) {
        case TccbDanhGiaFormChuyenVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case TccbDanhGiaFormChuyenVienUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i].id == updatedItem.id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------

export function getTccbDanhGiaFormChuyenVienAllByYear(nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien/all-by-year';
        T.get(url, { nam }, data => {
            if (data.error) {
                T.notify('Lấy form bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
            }
        });
    };
}


export function createTccbDanhGiaFormChuyenVienParent(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-parent';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới tiêu chí thành công!', 'success');
                if (done) done(data.item);
            }
        });
    };
}

export function deleteTccbDanhGiaFormChuyenVienParent(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-parent';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa tiêu chí bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá tiêu chí thành công', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa tiêu chí bị lỗi', 'danger'));
    };
}

export function updateTccbDanhGiaFormChuyenVienParent(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-parent';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật tiêu chí bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật tiêu chí thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật tiêu chí bị lỗi!', 'danger'));
    };
}

export function changeTccbDanhGiaFormChuyenVien(item) {
    return { type: TccbDanhGiaFormChuyenVienUpdate, item };
}

export function updateTccbDanhGiaFormChuyenVienThuTu(id, thuTu, nam, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-parent/thu-tu';
        T.put(url, { id, thuTu, nam }, (data) => {
            if (data.error) {
                T.notify('Thay đổi thứ tự tiêu chí bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, data.error);
            } else {
                T.notify('Thay đổi thứ tự tiêu chí thành công!', 'success');
                done && done();
            }
        },
            () => T.notify('Thay đổi thứ tự tiêu chí bị lỗi!', 'danger')
        );
    };
}

export function createTccbDanhGiaFormChuyenVienChild(item, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-child';
        T.post(url, { item }, data => {
            if (data.error) {
                T.notify(`Tạo mới bị lỗi: ${data.error.message}`, 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo mới nội dung thành công!', 'success');
                if (done) done(data.item);
            }
        });
    };
}

export function updateTccbDanhGiaFormChuyenVienChild(id, changes, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-child';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(`Cập nhật nội dung bị lỗi: ${data.error.message}`, 'danger');
                console.error(`PUT ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật nội dung thành công!', 'success');
                done && done(data.item);
            }
        }, () => T.notify('Cập nhật nội dung bị lỗi!', 'danger'));
    };
}

export function deleteTccbDanhGiaFormChuyenVienChild(id, done) {
    return () => {
        const url = '/api/tccb/danh-gia-form-chuyen-vien-child';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa nội dung bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Xoá nội dung thành công', 'success', false, 800);
                done && done();
            }
        }, () => T.notify('Xóa nội dung bị lỗi', 'danger'));
    };
}