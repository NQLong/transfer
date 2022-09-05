import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const InstructionGetPage = 'Instruction:GetPage';
const InstructionGet = 'Instruction:Get';

export default function hcthInstructionReducer(state = null, data) {
    switch (data.type) {
        case InstructionGetPage: {
            return Object.assign({}, state, { page: data.page });
        }
        case InstructionGet: {
            return Object.assign({}, state, { item: data.item });
        }
        default:
            return state;
    }
}

// Actions ----------------------------------------------------------------------------------------------------
T.initPage('instructionPage');

export function getInstructionPage(pageNumber, pageSize, done) {
    const page = T.updatePage('instructionPage', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/instruction/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hướng dẫn bị lỗi', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: InstructionGetPage, page: data.page });
                done && done(data.page);
            }
        }, () => T.notify('Lấy danh sách hướng dẫn bị lỗi!', 'danger'));
    };
}

export function getInstruction(id, done) {
    return dispatch => {
        const url = `/api/instruction/${id}`;
        T.get(url, res => {
            if (res.error) {
                T.notify('Lấy hướng dẫn bị lỗi' + (res.error.message && (':<br>' + res.error.message)), 'danger');
                console.error('GET: ' + url + '.', res.error);
            } else {
                T.notify('Lấy hướng dẫn thành công', 'success');
                dispatch({ type: InstructionGet, item: res.item });
                done && done(res.item);
            }
        });
    };
}

export function updateInstruction(id, changes, done) {
    return () => {
        const url = '/api/instruction';
        T.put(url, { id, changes }, res => {
            if (res.error) {
                T.notify('Cập nhật hướng dẫn sử dụng bị lỗi', 'danger');
                console.error(`PUT ${url}. ${res.error}`);
            } else {
                T.notify('Cập nhật hướng dẫn sử dụng thành công', 'success');
                done && done(res.item);
            }
        });
    };
}

export function createInstruction(data, done) {
    return () => {
        const url = '/api/instruction';
        T.post(url, { data }, res => {
            if (res.error) {
                T.notify('Thêm hướng dẫn sử dụng bị lỗi', 'danger');
                console.error('POST: ' + url + '.', res.error);
            } else {
                T.notify('Thêm hướng dẫn sử dụng thành công', 'success');
                done && done(data);
            }
        }, () => T.notify('Thêm hướng dẫn sử dụng bị lỗi!', 'danger'));
    };
}

export function deleteInstruction(id) {
    return dispatch => {
        const url = '/api/instruction';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá hướng dẫn sử dụng bị lỗi', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.notify('Xoá hướng dẫn sử dụng thành công', 'success');
                dispatch(getInstructionPage());
            }
        }, () => T.notify('Xoá hướng dẫn sử dụng bị lỗi!', 'danger'));
    };
}