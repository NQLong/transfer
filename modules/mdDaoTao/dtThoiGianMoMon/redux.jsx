import { changeThoiGianDangKyMoMon, getDtDangKyMoMonPage } from '../dtDangKyMoMon/redux';

export function getPageDtThoiGianMoMon(pageNumber, pageSize, done) {
    return () => {
        const url = `/api/dao-tao/page/thoi-gian-mo-mon/${pageNumber || 1}/${pageSize || 25}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(`Lỗi khi lấy danh sách thời gian mở môn: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            }
            else {
                done(data.page);
            }
        });
    };
}

export function createDtThoiGianMoMon(data, done) {
    return dispatch => {
        T.post('/api/dao-tao/thoi-gian-mo-mon', { data }, item => {
            if (item.error) {
                T.notify(`Lỗi tạo thời gian mở môn: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else {
                T.notify('Tạo thời gian mở môn thành công!', 'success');
                item.item.kichHoat && dispatch(changeThoiGianDangKyMoMon(item.item));
                done && done(item.item);
            }
        });
    };
}

export function deleteDtThoiGianMoMon(item, done) {
    return () => {
        T.delete('/api/dao-tao/thoi-gian-mo-mon', { id: item.id }, data => {
            if (data.error) {
                T.notify(`Lỗi xóa thời gian mở môn: ${data.error.message}`, 'danger');
                console.error(data.error.message);
            } else {
                T.alert('Xóa thành công!', 'success', false, 800);
                done && done(item.id);
            }
        });
    };
}

export function updateDtThoiGianMoMon(id, changes, done) {
    return dispatch => {
        T.put('/api/dao-tao/thoi-gian-mo-mon', { id, changes }, data => {
            if (data.error) T.notify('Cập nhật thất bại!', 'danger');
            else {
                T.notify('Cập nhật thành công!', 'success');
                dispatch(getDtDangKyMoMonPage());
                done && done(data.item);
            }
        });
    };
}