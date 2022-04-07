import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmKhoiKienThucGetPage = 'DmKhoiKienThuc:GetPage';
const DmKhoiKienThucUpdate = 'DmKhoiKienThuc:Update';

export default function DmKhoiKienThucReducer(state = null, data) {
  switch (data.type) {
    case DmKhoiKienThucGetPage:
      return Object.assign({}, state, { page: data.page });
    case DmKhoiKienThucUpdate:
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
T.initPage('pageDmKhoiKienThuc');
export function getDmKhoiKienThucPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmKhoiKienThuc', pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/pdt/khoi-kien-thuc/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: pageCondition }, data => {
      if (data.error) {
        T.notify('Lấy danh sách khối kiến thức bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (page.pageCondition) data.page.pageCondition = page.pageCondition;
        if (done) done(data.page);
        dispatch({ type: DmKhoiKienThucGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách khối kiến thức bị lỗi!', 'danger'));
  };
}

export function getDmKhoiKienThuc(ma, done) {
  return () => {
    const url = `/api/pdt/khoi-kien-thuc/item/${ma}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin khối kiến thức bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

export function createDmKhoiKienThuc(item, done) {
  return dispatch => {
    const url = '/api/pdt/khoi-kien-thuc';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo khối kiến thức bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        if (done) done(data.error);
      } else {
        T.notify('Tạo mới thông tin khối kiến thức thành công!', 'success');
        dispatch(getDmKhoiKienThucPage());
        if (done) done(data);
      }
    }, () => T.notify('Tạo khối kiến thức bị lỗi!', 'danger'));
  };
}

export function deleteDmKhoiKienThuc(ma) {
  return dispatch => {
    const url = '/api/pdt/khoi-kien-thuc';
    T.delete(url, { ma }, data => {
      if (data.error) {
        T.notify('Xóa danh mục khối kiến thức bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDmKhoiKienThucPage());
      }
    }, () => T.notify('Xóa khối kiến thức bị lỗi!', 'danger'));
  };
}

export function updateDmKhoiKienThuc(id, changes, done) {
  return dispatch => {
    const url = '/api/pdt/khoi-kien-thuc';
    T.put(url, { id, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin khối kiến thức bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin khối kiến thức thành công!', 'success');
        dispatch(getDmKhoiKienThucPage());
        if (done) done();
      }
    }, () => T.notify('Cập nhật thông tin khối kiến thức bị lỗi!', 'danger'));
  };
}

export const SelectAdapter_DmKhoiKienThucAll = {
  ajax: true,
  url: '/api/pdt/khoi-kien-thuc/all',
  data: params => ({ condition: params.term }),
  processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.ma, text: item.ten })) : [] }),
  fetchOne: (ma, done) => (getDmKhoiKienThuc(ma, item => done && done({ id: item.ma, text: item.ten })))(),
};