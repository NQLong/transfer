import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const DtDangKyMoMonGetPage = 'DtDangKyMoMon:GetPage';
const DtDangKyMoMonUpdate = 'DtDangKyMoMon:Update';
const DtDangKyMoMonCreate = 'DtDangKyMoMon:Create';
const DtThoiGianDangKyMoMon = 'DtThoiGianDangKyMoMon:Get';
// const DtDangKyMoMonGetItem = 'DtDangKyMoMon:GetItem';

export default function dtDangKyMoMonReducer(state = null, data) {
    switch (data.type) {
        case DtDangKyMoMonGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtDangKyMoMonUpdate:
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
        case DtDangKyMoMonCreate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    createdItem = data.item;
                updatedPage && createdItem.id && updatedPage.list.unshift(createdItem);
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        case DtThoiGianDangKyMoMon:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedThoiGian = data.item;
                let newPage = Object.assign({}, updatedPage, { thoiGianMoMon: updatedThoiGian.kichHoat ? updatedThoiGian : null });
                return Object.assign({}, state, { page: newPage });
            } else return null;
        default:
            return state;
    }
}

export const PageName = 'pageDtDangKyMoMon';
T.initPage(PageName);

export function getDtDangKyMoMonPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
    return dispatch => {
        const url = `/api/dao-tao/dang-ky-mo-mon/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { searchTerm: pageCondition?.searchText, donViFilter: pageCondition?.donViFilter }, data => {
            if (data.error) {
                T.notify(`Lấy danh sách đăng ký mở môn bị lỗi: ${data.error.message}`, 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtDangKyMoMonGetPage, page: data.page });
                done && done();
            }
        });
    };
}
export function createDangKyMoMon(data, done) {
    return dispatch => {
        const url = '/api/dao-tao/dang-ky-mo-mon';
        T.post(url, { data }, item => {
            if (item.error) {
                T.notify(`Lỗi: ${item.error.message}`, 'danger');
                console.error(item.error.message);
            } else {
                T.notify('Tạo đăng ký môn thành công', 'success');
                dispatch(getDtDangKyMoMonPage());
                done && done(item.item);
            }
        });
    };
}
export function changeThoiGianDangKyMoMon(item) {
    return { type: DtThoiGianDangKyMoMon, item };
}

export function saveDangKyMoMon(id, settings, items, done) {
    let data, isDuyet = 0;
    if (!Array.isArray(items)) {
        data = items.data;
        isDuyet = items.isDuyet;
    } else data = items;
    return () => {
        const url = '/api/dao-tao/dang-ky-mo-mon';
        T.put(url, { id, data, settings, isDuyet }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
            } else {
                !done && T.notify('Lưu thành công', 'success');
                done && done(result.item);
            }
        }
        );
    };
}
