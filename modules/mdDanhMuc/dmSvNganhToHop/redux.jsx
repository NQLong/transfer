import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvNganhToHopGetPage = 'DmSvNganhToHop:GetPage';
const DmSvNganhToHopUpdate = 'DmSvNganhToHop:Update';

export default function DmSvNganhToHopReducer(state = null, data) {
  switch (data.type) {
    case DmSvNganhToHopGetPage:
      return Object.assign({}, state, { page: data.page });
    case DmSvNganhToHopUpdate:
      if (state) {
        let updatedItems = Object.assign({}, state.items),
          updatedPage = Object.assign({}, state.page),
          updatedItem = data.item;
        if (updatedItems) {
          for (let i = 0, n = updatedItems.length; i < n; i++) {
            if (updatedItems[i].maNganh == updatedItem.maNganh) {
              updatedItems.splice(i, 1, updatedItem);
              break;
            }
          }
        }
        if (updatedPage) {
          for (let i = 0, n = updatedPage.list.length; i < n; i++) {
            if (updatedPage.list[i].maNganh == updatedItem.maNganh) {
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
T.initPage('pageDmSvNganhToHop');
export function getDmSvNganhToHopPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmSvNganhToHop', pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/danh-muc/dao-tao/nganh-theo-to-hop-thi/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: page.pageCondition }, data => {
      if (data.error) {
        T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (page.pageCondition) data.page.pageCondition = page.pageCondition;
        if (done) done(data.page);
        dispatch({ type: DmSvNganhToHopGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách ngành bị lỗi!', 'danger'));
  };
}

export function getDmSvNganhToHop(id, done) {
  return () => {
    const url = `/api/danh-muc/dao-tao/nganh-theo-to-hop-thi/item/${id}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin ngành bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

export function createDmSvNganhToHop(item, done) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/nganh-theo-to-hop-thi';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo ngành bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        if (done) done(data.error);
      } else {
        T.notify('Tạo mới thông tin ngành thành công!', 'success');
        dispatch(getDmSvNganhToHopPage());
        if (done) done(data);
      }
    }, () => T.notify('Tạo ngành bị lỗi!', 'danger'));
  };
}

export function deleteDmSvNganhToHop(id) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/nganh-theo-to-hop-thi';
    T.delete(url, { id: id }, data => {
      if (data.error) {
        T.notify('Xóa danh mục ngành bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDmSvNganhToHopPage());
      }
    }, () => T.notify('Xóa ngành bị lỗi!', 'danger'));
  };
}

export function updateDmSvNganhToHop(id, changes, done) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/nganh-theo-to-hop-thi';
    T.put(url, { id, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin ngành bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin ngành thành công!', 'success');
        dispatch(getDmSvNganhToHopPage());
        if (done) done();
      }
    }, () => T.notify('Cập nhật thông tin ngành bị lỗi!', 'danger'));
  };
}

export function changeDmSvNganhToHop(item) {
  return { type: DmSvNganhToHopUpdate, item };
}

// export const SelectAdapter_DmSvNganhToHop = {
//   ajax: true,
//   url: '/api/danh-muc/dao-tao/nganh-theo-to-hop-thi/page/1/20',
//   data: params => ({ condition: params.term }),
//   processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.id, text: item. })) : [] }),
//   fetchOne: (maNganh, done) => (getDmSvNganhToHop(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh })))(),
// };