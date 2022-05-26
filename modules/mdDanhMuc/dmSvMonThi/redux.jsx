import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvMonThiGetPage = 'DmSvMonThi:GetPage';
const DmSvMonThiUpdate = 'DmSvMonThi:Update';

export default function DmSvMonThiReducer(state = null, data) {
  switch (data.type) {
    case DmSvMonThiGetPage:
      return Object.assign({}, state, { page: data.page });
    case DmSvMonThiUpdate:
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
T.initPage('pageDmSvMonThi');
export function getDmSvMonThiPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmSvMonThi', pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/danh-muc/mon-thi/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: pageCondition }, data => {
      console.log(pageCondition);
      if (data.error) {
        T.notify('Lấy danh sách môn thi bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (page.pageCondition) data.page.pageCondition = page.pageCondition;
        if (done) done(data.page);
        dispatch({ type: DmSvMonThiGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách môn thi bị lỗi!', 'danger'));
  };
}

export function getDmSvMonThi(id, done) {
  return () => {
    const url = `/api/danh-muc/mon-thi/item/${id}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin môn thi bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

export function createDmSvMonThi(item, done) {
  return dispatch => {
    const url = '/api/danh-muc/mon-thi';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo môn thi bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        if (done) done(data.error);
      } else {
        T.notify('Tạo mới thông tin môn thi thành công!', 'success');
        dispatch(getDmSvMonThiPage());
        if (done) done(data);
      }
    }, () => T.notify('Tạo môn thi bị lỗi!', 'danger'));
  };
}

export function deleteDmSvMonThi(id) {
  return dispatch => {
    const url = '/api/danh-muc/mon-thi';
    T.delete(url, { id: id }, data => {
      if (data.error) {
        T.notify('Xóa danh mục môn thi bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDmSvMonThiPage());
      }
    }, () => T.notify('Xóa môn thi bị lỗi!', 'danger'));
  };
}

export function updateDmSvMonThi(id, changes, done) {
  return dispatch => {
    const url = '/api/danh-muc/mon-thi';
    T.put(url, { id, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin môn thi bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin môn thi thành công!', 'success');
        dispatch(getDmSvMonThiPage());
        if (done) done();
      }
    }, () => T.notify('Cập nhật thông tin môn thi bị lỗi!', 'danger'));
  };
}

export const SelectAdapter_DmSvMonThi = {
  ajax: true,
  url: '/api/danh-muc/mon-thi/page/1/20',
  data: params => ({ condition: params.term, kichHoat: 1 }),
  processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item.ten })) : [] }),
  getOne: getDmSvMonThi,
  fetchOne: (id, done) => (getDmSvMonThi(id, item => done && done({ id: item.id, text: item.ten })))(),
  processResultOne: response => response && ({ value: response.id, text: response.id + ': ' + response.ten }),
  // fetchOne: (id, done) => (getDmSvMonThi(id, item => done && done({ id: item.id, text: item.ten })))(),
};