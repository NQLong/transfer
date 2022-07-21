import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvKhuVucTuyenSinhGetPage = 'DmSvKhuVucTuyenSinh:GetPage';
const DmSvKhuVucTuyenSinhUpdate = 'DmSvKhuVucTuyenSinh:Update';

export default function DmSvKhuVucTuyenSinhReducer(state = null, data) {
	switch (data.type) {
		case DmSvKhuVucTuyenSinhGetPage:
			return Object.assign({}, state, { page: data.page });
		case DmSvKhuVucTuyenSinhUpdate:
			if (state) {
				let updatedItems = Object.assign({}, state.items),
					updatedPage = Object.assign({}, state.page),
					updatedItem = data.item;
				if (updatedItems) {
					for (let i = 0, n = updatedItems.length; i < n; i++) {
						if (updatedItems[i].ma == updatedItem.ma) {
							updatedItems.splice(i, 1, updatedItem);
							break;
						}
					}
				}
				if (updatedPage) {
					for (let i = 0, n = updatedPage.list.length; i < n; i++) {
						if (updatedPage.list[i].ma == updatedItem.ma) {
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
T.initPage('pageDmSvKhuVucTuyenSinh');
export function getDmSvKhuVucTuyenSinhPage(pageNumber, pageSize, pageCondition, done) {
	const page = T.updatePage('pageDmSvKhuVucTuyenSinh', pageNumber, pageSize);
	return dispatch => {
		const url = `/api/danh-muc/khu-vuc-tuyen-sinh/page/${page.pageNumber}/${page.pageSize}`;
		T.get(url, { condition: pageCondition }, data => {
			if (data.error) {
				T.notify('Lấy danh sách khu vực bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
				dispatch({ type: DmSvKhuVucTuyenSinhGetPage, page: data.page });
			}
		}, () => T.notify('Lấy danh sách khu vực bị lỗi!', 'danger'));
	};
}

export function getDmSvKhuVucTuyenSinh(ma, done) {
	return () => {
		const url = `/api/danh-muc/khu-vuc-tuyen-sinh/item/${ma}`;
		T.get(url, data => {
			if (data.error) {
				T.notify('Lấy thông tin khu vực bị lỗi!', 'danger');
				console.error(`GET: ${url}.`, data.error);
			} else {
				if (done) done(data.item);
			}
		}, error => console.error(`GET: ${url}.`, error));
	};
}

export function createDmSvKhuVucTuyenSinh(item, done) {
	return dispatch => {
		const url = '/api/danh-muc/khu-vuc-tuyen-sinh';
		T.post(url, { data: item }, data => {
			if (data.error) {
				T.notify(data.error.message || 'Tạo khu vực bị lỗi', 'danger');
				console.error(`POST: ${url}.`, data.error);
				if (done) done(data.error);
			} else {
				T.notify('Tạo mới thông tin khu vực thành công!', 'success');
				dispatch(getDmSvKhuVucTuyenSinhPage());
				if (done) done(data);
			}
		}, () => T.notify('Tạo khu vực bị lỗi!', 'danger'));
	};
}

export function deleteDmSvKhuVucTuyenSinh(ma) {
	return dispatch => {
		const url = '/api/danh-muc/khu-vuc-tuyen-sinh';
		T.delete(url, { ma: ma }, data => {
			if (data.error) {
				T.notify('Xóa danh mục khu vực bị lỗi!', 'danger');
				console.error(`DELETE: ${url}.`, data.error);
			} else {
				T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
				dispatch(getDmSvKhuVucTuyenSinhPage());
			}
		}, () => T.notify('Xóa khu vực bị lỗi!', 'danger'));
	};
}

export function updateDmSvKhuVucTuyenSinh(ma, changes, done) {
	return dispatch => {
		const url = '/api/danh-muc/khu-vuc-tuyen-sinh';
		T.put(url, { ma, changes }, data => {
			if (data.error || changes == null) {
				T.notify(data.error.message || 'Cập nhật thông tin khu vực bị lỗi', 'danger');
				console.error(`PUT: ${url}.`, data.error);
				done && done(data.error);
			} else {
				T.notify('Cập nhật thông tin khu vực thành công!', 'success');
				dispatch(getDmSvKhuVucTuyenSinhPage());
				if (done) done();
			}
		}, () => T.notify('Cập nhật thông tin khu vực bị lỗi!', 'danger'));
	};
}

export function changeDmSvKhuVucTuyenSinh(item) {
	return { type: DmSvKhuVucTuyenSinhUpdate, item };
}

export const SelectAdapter_DmSvKhuVucTuyenSinh = {
	ajax: true,
	url: '/api/danh-muc/khu-vuc-tuyen-sinh/page/1/20',
	data: params => ({ condition: params.term }),
	processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
	getOne: getDmSvKhuVucTuyenSinh,
	processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};