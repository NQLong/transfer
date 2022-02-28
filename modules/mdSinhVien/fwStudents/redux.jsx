import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const sinhVienGetAll = 'sinhVien:GetAll';
const sinhVienGetPage = 'sinhVien:GetPage';
const sinhVienUpdate = 'sinhVien:Update';
const sinhVienUserGet = 'sinhVien:UserGet';

export default function sinhVienReducer(state = null, data) {
    switch (data.type) {
        case sinhVienGetAll:
            return Object.assign({}, state, { items: data.items });
        case sinhVienGetPage:
            return Object.assign({}, state, { page: data.page });
        case sinhVienUserGet:
            return Object.assign({}, state, { selectedItem: data.item });
        case sinhVienUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
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

//ACTIONS--------------------------------------------------------------------------------------------------
export function getSinhVienEditUser(done) {
    return dispatch => {
        const url = '/api/user/sinh-vien/edit/item';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
                console.error(`GET: ${url}.`, data.error.message);
            } else {
                done && done(data);
                dispatch({ type: sinhVienUserGet, item: data.item });
            }
        }, () => console.log('Lấy thông tin sinh viên bị lỗi!'));
    };
}

