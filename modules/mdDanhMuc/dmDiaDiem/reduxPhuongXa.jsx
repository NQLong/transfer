import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmPhuongXaGetAll = 'DmPhuongXa:GetAll';
const DmPhuongXaGetPage = 'DmPhuongXa:GetPage';
const DmPhuongXaUpdate = 'DmPhuongXa:Update';

export default function DmPhuongXaReducer(state = null, data) {
	switch (data.type) {
		case DmPhuongXaGetAll:
			return Object.assign({}, state, { items: data.items });
		case DmPhuongXaGetPage:
			return Object.assign({}, state, { page: data.page });
		case DmPhuongXaUpdate:
			if (state) {
				let updatedItems = Object.assign({}, state.items),
					updatedPage = Object.assign({}, state.page),
					updatedItem = data.item;
				if (updatedItems) {
					for (let i = 0, n = updatedItems.length; i < n; i++) {
						if (updatedItems[i].maPhuongXa == updatedItem.maPhuongXa) {
							updatedItems.splice(i, 1, updatedItem);
							break;
						}
					}
				}
				if (updatedPage) {
					for (let i = 0, n = updatedPage.list.length; i < n; i++) {
						if (updatedPage.list[i].maPhuongXa == updatedItem.maPhuongXa) {
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
export function getDmPhuongXaAll(done) {
	return dispatch => {
		const url = '/api/danh-muc/phuong-xa/all';
		T.get(url, data => {
			if (data.error) {
				T.notify('Lấy danh sách phường xã bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.items);
				dispatch({ type: DmPhuongXaGetAll, items: data.items ? data.items : [] });
			}
		}, error => T.notify('Lấy danh sách phường xã bị lỗi!', 'danger'));
	};
}

T.initPage('dmPhuongXa');
export function getDmPhuongXaPage(pageNumber, pageSize, pageCondition, done) {
	const page = T.updatePage('dmPhuongXa', pageNumber, pageSize, pageCondition);
	return dispatch => {
		const url = `/api/danh-muc/phuong-xa/page/${page.pageNumber}/${page.pageSize}`;
		T.get(url, { condition: page.pageCondition }, data => {
			if (data.error) {
				T.notify('Lấy danh sách phường xã bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (page.pageCondition) data.page.pageCondition = page.pageCondition;
				if (done) done(data.page);
				dispatch({ type: DmPhuongXaGetPage, page: data.page });
			}
		}, error => T.notify('Lấy danh sách phường xã bị lỗi!', 'danger'));
	};
}

export function getDmPhuongXa(maPhuongXa, done) {
	return dispatch => {
		const url = `/api/danh-muc/phuong-xa/item/${maPhuongXa}`;
		T.get(url, data => {
			if (data.error) {
				T.notify('Lấy thông tin phường xã bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.item);
			}
		}, error => {
			console.error(`GET: ${url}.`, error);
		});
	};
}

export function createDmPhuongXa(item, done) {
	return dispatch => {
		const url = '/api/danh-muc/phuong-xa';
		T.post(url, { item }, data => {
			if (data.error) {
				console.error(`POST: ${url}.`, data.error);
				T.notify('Tạo thông tin phường xã bị lỗi!', 'danger');
			} else {
				dispatch(getDmPhuongXaPage());
				if (done) done(data);
				T.notify('Tạo thông tin phường xã thành công!', 'success');
			}
		}, error => T.notify('Tạo thông tin phường xã bị lỗi!', 'danger'));
	};
}

export function deleteDmPhuongXa(maPhuongXa) {
	return dispatch => {
		const url = '/api/danh-muc/phuong-xa';
		T.delete(url, { maPhuongXa }, data => {
			if (data.error) {
				T.notify('Xóa thông tin phường xã bị lỗi!', 'danger');
				console.error(`DELETE: ${url}.`, data.error);
			} else {
				T.alert('Xoá thành công!', 'success', false, 800);
				dispatch(getDmPhuongXaPage());
			}
		}, error => T.notify('Xóa thông tin phường xã bị lỗi!', 'danger'));
	};
}

export function updateDmPhuongXa(maPhuongXa, changes, done) {
	return dispatch => {
		const url = '/api/danh-muc/phuong-xa';
		T.put(url, { maPhuongXa, changes }, data => {
			if (data.error || changes == null) {
				T.notify('Cập nhật thông phường xã bị lỗi!', 'danger');
				console.error(`PUT: ${url}.`, data.error);
				done && done(data.error);
			} else {
				T.notify('Cập nhật thông tin phường xã thành công!', 'success');
				dispatch(getDmPhuongXaPage());
			}
		}, error => T.notify('Cập nhật thông tin phường xã bị lỗi!', 'danger'));
	};
}
export function createDmPhuongXaByUpload(item, done) {
	return dispatch => {
		const url = '/api/danh-muc/phuong-xa/createFromFile';
		T.post(url, { item }, data => {
			if (data.error) {
				console.error(`POST: ${url}.`, data.error);
				T.notify('Tạo thông tin phường xã bị lỗi!', 'danger');
			} else {
				dispatch(getDmPhuongXaPage());
				if (done) done(data);
				T.notify('Import dữ liệu thành công!', 'success');
			}
		}, error => T.notify('Tạo thông tin phường xã bị lỗi!', 'danger'));
	};
}

export function changeDmPhuongXa(item) {
	return { type: DmPhuongXaUpdate, item };
}

export const SelectAdapter_DmPhuongXa = {
	ajax: false,
	getAll: getDmPhuongXaAll,
	processResults: response => ({ results: response ? response.map(item => ({ value: item.maPhuongXa, text: item.maPhuongXa + ': ' + item.tenPhuongXa, maQuanHuyen: item.maQuanHuyen })) : [] }),
	condition: { kichHoat: 1 },
};
