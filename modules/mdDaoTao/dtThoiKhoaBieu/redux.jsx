import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtThoiKhoaBieuGetAll = 'DtThoiKhoaBieu:GetAll';
const DtThoiKhoaBieuGetPage = 'DtThoiKhoaBieu:GetPage';
const DtThoiKhoaBieuUpdate = 'DtThoiKhoaBieu:Update';
const DtThoiKhoaBieuConfig = 'DtThoiKhoaBieu:Config';
const DtThoiKhoaBieuConfigUpdate = 'DtThoiKhoaBieu:ConfigUpdate';

export default function dtThoiKhoaBieuReducer(state = null, data) {
    switch (data.type) {
        case DtThoiKhoaBieuConfigUpdate:
            if (state) {
                let currentState = Object.assign({}, state),
                    dataCanGen = currentState.dataCanGen;
                for (let i = 0, n = dataCanGen.length; i < n; i++) {
                    if (dataCanGen[i].id == data.item.id) {
                        dataCanGen.splice(i, 1, { ...dataCanGen[i], ...data.item });
                        break;
                    }
                }
                return Object.assign({}, state, currentState);
            } else {
                return null;
            }
        case DtThoiKhoaBieuConfig:
            return Object.assign({}, data.items);
        case DtThoiKhoaBieuGetAll:
            return Object.assign({}, state, { items: data.items });
        case DtThoiKhoaBieuGetPage:
            return Object.assign({}, state, { page: data.page });
        case DtThoiKhoaBieuUpdate:
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage.list) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i].id == updatedItem.id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return null;
            }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDtThoiKhoaBieuAll(condition, done) {
    if (typeof condition === 'function') {
        done = condition;
        condition = {};
    }
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: DtThoiKhoaBieuGetAll, items: data.items ? data.items : [] });
            }
        });
    };
}

T.initPage('pageDtThoiKhoaBieu');
export function getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter, done) {
    const page = T.updatePage('pageDtThoiKhoaBieu', pageNumber, pageSize, pageCondition, filter);
    return dispatch => {
        const url = `/api/dao-tao/thoi-khoa-bieu/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition, filter }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thời khoá biểu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
            } else {
                dispatch({ type: DtThoiKhoaBieuGetPage, page: data.page });
                if (done) done(data.page);
            }
        });
    };
}

export function createDtThoiKhoaBieu(item, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu/multiple';
        T.post(url, { item, settings }, data => {
            if (data.error) {
                T.notify('Tạo thời khoá biểu bị lỗi!', 'danger');
                console.error(`POST ${url}. ${data.error.message}`);
            } else {
                T.notify('Tạo thời khoá biểu thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done();
            }
        });
    };
}

export function checkIfExistDtThoiKhoaBieu(data, done) {
    return () => {
        const url = '/api/dao-tao/thoi-khoa-bieu/check-if-exist';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify('Kiểm tra các ràng buộc lỗi', 'danger');
            } else if (result.warning) {
                T.confirm('Cảnh báo', `${result.warning}. Bạn vẫn muốn tạo thêm?`, true, isConfirm => {
                    isConfirm && done(result.maxNhomCurrent);
                });
            } else {
                done && done(0);
            }
        });
    };
}

export function createDtThoiKhoaBieuMultiple(data, settings, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu/create-multiple';
        T.post(url, { data, settings }, result => {
            if (result.error) {
                T.notify('Tạo lớp bị lỗi!', 'danger');
                console.error(`POST ${url}. ${result.error.message}`);
                done && done();
            } else if (result.warning) {
                T.confirm('Cảnh báo', `${result.warning}. Bạn vẫn muốn tạo thêm?`, true, isConfirm => {
                    if (isConfirm) {
                        createDtThoiKhoaBieuMultiple({ ...data, confirmCreate: true }, settings, done);
                    }
                });
            }
            else {
                T.notify('Tạo lớp thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                if (done) done(result);
            }
        });
    };
}
export function deleteDtThoiKhoaBieu(id, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa thời khoá biểu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}.`, data.error);
            } else {
                T.alert('Thời khoá biểu đã xóa thành công!', 'success', false, 800);
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done();
            }
        }, () => T.notify('Xóa thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieu(id, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.alert(`Lỗi: ${data.error.message}`, 'error', false, 2000);
                console.error(`PUT ${url}. ${data.error}`);
                done && done(data);
            } else {
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                done && done(data);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function updateDtThoiKhoaBieuCondition(condition, changes, done) {
    return dispatch => {
        const cookie = T.updatePage('pageDtThoiKhoaBieu');
        const { pageNumber, pageSize, pageCondition, filter } = cookie;
        const url = '/api/dao-tao/thoi-khoa-bieu-condition';
        T.put(url, { condition, changes }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(`PUT ${url}. ${result.error}`);
                done && done(result);
            } else {
                // T.notify('Điều chỉnh thành công!', 'success');
                dispatch(getDtThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter));
                dispatch({ type: DtThoiKhoaBieuConfigUpdate, data: { currentId: result.item.id, currentData: result.item } });
                done && done(result);
            }
        }, () => T.notify('Cập nhật thông tin thời khoá biểu bị lỗi!', 'danger'));
    };
}

export function initSchedule(ngayBatDau, done) {
    return () => {
        T.get('/api/dao-tao/init-schedule', { ngayBatDau }, data => {
            done && done(data);
        });
    };
}

export function autoGenSched(config, listConfig, done) {
    return dispatch => {
        T.post('/api/dao-tao/gen-schedule', { config, listConfig }, result => {
            if (result.error) {
                T.notify(`Lỗi sinh thời khoá biểu: ${result.error.message}`, 'danger');
            } else {
                T.alert('Sinh thời khoá biểu thành công', 'success', false);
                dispatch(getDtThoiKhoaBieuPage());
                done && done(result);
            }
        });
    };
}

export function changeDtThoiKhoaBieu(item) {
    return { type: DtThoiKhoaBieuUpdate, item };
}

export function getDtLichDayHoc(phong, done) {
    return () => {
        T.get('/api/dao-tao/get-schedule', { phong }, data => {
            if (data.error) {
                T.notify(`Lỗi: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else {
                done && done(data);
            }
        });
    };
}

// Generate action -----------------------------------------------------------------------------------------------------------------------------------------------------------
export function getDtThoiKhoaBieuByConfig(config, done) {
    return dispatch => {
        T.post('/api/dao-tao/thoi-khoa-bieu/get-by-config', { config }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error.message);
                done && done(result);
            } else {
                dispatch({ type: DtThoiKhoaBieuConfig, items: result });
                done && done(result);
            }
        });
    };
}

export function resetDtThoiKhoaBieuConfig(done) {
    return dispatch => {
        dispatch({ type: DtThoiKhoaBieuConfig, items: {} });
        done && done();
    };
}

export function updateCheckDtThoiKhoaBieu(id, isMo, done) {
    return dispatch => {
        T.put('/api/dao-tao/thoi-khoa-bieu/update-check', { id, isMo }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message || 'hệ thống'}`, 'danger');
                console.error(result.error);
            } else {
                dispatch({ type: DtThoiKhoaBieuConfigUpdate, item: result.item });
                done && done();
            }
        });

    };
}

export function updateDtThoiKhoaBieuConfig(data, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu-condition';
        T.put(url, { condition: data.currentId, changes: data.currentData }, result => {
            if (result.error) {
                T.notify(`Lỗi: ${result.error.message}`, 'danger');
                console.error(result.error);
            } else {
                T.notify('Cập nhật thành công', 'success');
                dispatch(getDtThoiKhoaBieuByConfig(data.conf));
                done && done();
            }
        });
    };
}

export function dtThoiKhoaBieuGenTime(data, doneError, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu/generate-time';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lỗi ${result.error.message || 'hệ thống'}`, 'danger');
                doneError && doneError();
            } else {
                dispatch({ type: DtThoiKhoaBieuConfig, items: { dataCanGen: result.dataReturn } });
                done && done(result.dataReturn);
            }
        });
    };
}

export function dtThoiKhoaBieuGenRoom(data, done) {
    return dispatch => {
        const url = '/api/dao-tao/thoi-khoa-bieu/generate-room-end-date';
        T.post(url, { data }, result => {
            if (result.error) {
                T.notify(`Lồi: ${result.error.message || 'Sinh tự động thất bại'}`, 'danger');
            } else {
                dispatch({ type: DtThoiKhoaBieuConfig, items: { dataCanGen: result.dataReturn } });
                done && done(result.dataReturn);
            }
        });
    };
}

export function updateDtThoiKhoaBieuGenData(data, done) {
    return () => {
        const url = '/api/dao-tao/thoi-khoa-bieu/save-gen-data';
        T.put(url, { data }, result => {
            if (result.error) {
                T.notify(`Lồi: ${result.error.message || 'cập nhật thất bại'}`, 'danger');
            } else {
                T.notify('Lưu dữ liệu thành công', 'success');
            }
            done && done(result);
        });
    };
}
