import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmQuanHuyenGetAll = 'DmQuanHuyen:GetAll';
const DmQuanHuyenGetPage = 'DmQuanHuyen:GetPage';
const DmQuanHuyenUpdate = 'DmQuanHuyen:Update';

export default function DmQuanHuyenReducer(state = null, data) {
	switch (data.type) {
		case DmQuanHuyenGetAll:
			return Object.assign({}, state, { items: data.items });
		case DmQuanHuyenGetPage:
			return Object.assign({}, state, { page: data.page });
		case DmQuanHuyenUpdate:
			if (state) {
				let updatedItems = Object.assign({}, state.items),
					updatedPage = Object.assign({}, state.page),
					updatedItem = data.item;
				if (updatedItems) {
					for (let i = 0, n = updatedItems.length; i < n; i++) {
						if (updatedItems[i].maQuanHuyen == updatedItem.maQuanHuyen) {
							updatedItems.splice(i, 1, updatedItem);
							break;
						}
					}
				}
				if (updatedPage) {
					for (let i = 0, n = updatedPage.list.length; i < n; i++) {
						if (updatedPage.list[i].maQuanHuyen == updatedItem.maQuanHuyen) {
							updatedPage.list.splice(i, 1, updatedItem);
							break;
						}
					}
				}
				return Object.assign({}, state, { items: updatedItems, page: updatedPage })
			} else {
				return null;
			}
		default:
			return state;
	}
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDmQuanHuyenAll(done) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen/all`;
		T.get(url, data => {
			if (data.error) {
				T.notify('Lấy danh sách quận huyện bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.items);
				dispatch({ type: DmQuanHuyenGetAll, items: data.items ? data.items : [] });
			}
		}, error => T.notify('Lấy danh sách quận huyện bị lỗi!', 'danger'));
	}
}

T.initPage('dmQuanHuyen');
export function getDmQuanHuyenPage(pageNumber, pageSize, pageCondition, done) {
	const page = T.updatePage('dmQuanHuyen', pageNumber, pageSize, pageCondition);
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen/page/${page.pageNumber}/${page.pageSize}`;
		T.get(url, { condition: page.pageCondition }, data => {
			if (data.error) {
				T.notify('Lấy danh sách quận huyện bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (page.pageCondition) data.page.pageCondition = page.pageCondition;
				if (done) done(data.page);
				dispatch({ type: DmQuanHuyenGetPage, page: data.page });
			}
		}, error => T.notify('Lấy danh sách quận huyện bị lỗi!', 'danger'));
	}
}

export function getDmQuanHuyen(ma, done) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen/item/${ma}`;
		T.get(url, data => {
			if (data.error) {
				T.notify('Lấy thông tin quận huyện bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.item);
				T.notify('Lấy thông tin quận huyện thành công!', 'success');
			}
		}, error => {
			console.error(`GET: ${url}.`, error);
		});
	}
}

export function createDmQuanHuyen(item, done) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen`;
		T.post(url, { item }, data => {
			if (data.error) {
				console.error(`POST: ${url}.`, data.error);
				T.notify('Tạo thông tin quận huyện bị lỗi!', 'danger')
			} else {
				dispatch(getDmQuanHuyenPage());
				if (done) done(data);
				T.notify('Tạo thông tin quận huyện thành công!', 'success')
			}
		}, error => T.notify('Tạo thông tin quận huyện bị lỗi!', 'danger'));
	}
}

export function deleteDmQuanHuyen(maQuanHuyen) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen`;
		T.delete(url, { maQuanHuyen }, data => {
			if (data.error) {
				T.notify('Xóa thông tin quận huyện bị lỗi!', 'danger');
				console.error(`DELETE: ${url}.`, data.error);
			} else {
				T.alert('Xoá thành công!', 'success', false, 800);
				dispatch(getDmQuanHuyenPage());
			}
		}, error => T.notify('Xóa thông tin quận huyện bị lỗi!', 'danger'));
	}
}

export function updateDmQuanHuyen(maQuanHuyen, changes, done) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen`;
		T.put(url, { maQuanHuyen, changes }, data => {
			if (data.error || changes == null) {
				T.notify('Cập nhật thông quận huyện bị lỗi!', 'danger');
				console.error(`PUT: ${url}.`, data.error);
				done && done(data.error);
			} else {
				T.notify('Cập nhật thông tin quận huyện thành công!', 'success');
				dispatch(getDmQuanHuyenPage());
			}
		}, error => T.notify('Cập nhật thông tin quận huyện bị lỗi!', 'danger'));
	}
}

export function createDmQuanHuyenByUpload(item, done) {
	return dispatch => {
		const url = `/api/danh-muc/quan-huyen/createFromFile`;
		T.post(url, { item }, data => {
			if (data.error) {
				console.error(`POST: ${url}.`, data.error);
				T.notify('Tạo thông tin quận huyện bị lỗi!', 'danger')
			} else {
				dispatch(getDmQuanHuyenPage());
				if (done) done(data);
				T.notify('Import dữ liệu thành công!', 'success');
			}
		}, error => T.notify('Tạo thông tin quận huyện bị lỗi!', 'danger'));
	}
}

export function changeDmQuanHuyen(item) {
	return { type: DmQuanHuyenUpdate, item };
}

export const SelectAdapter_DmQuanHuyen = {
	ajax: false,
	getAll: getDmQuanHuyenAll,
	processResults: response => ({ results: response ? response.map(item => ({ value: item.maQuanHuyen, text: item.maQuanHuyen + ': ' + item.tenQuanHuyen, maTinhThanhPho: item.maTinhThanhPho })) : [] }),
	condition: { kichHoat: 1 },
}
