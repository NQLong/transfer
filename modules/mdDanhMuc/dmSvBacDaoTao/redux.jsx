import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmSvBacDaoTaoGetPage = 'DmSvBacDaoTao:GetPage';
const DmSvBacDaoTaoUpdate = 'DmSvBacDaoTao:Update';

export default function DmSvBacDaoTaoReducer(state = null, data) {
  switch (data.type) {
    case DmSvBacDaoTaoGetPage:
      return Object.assign({}, state, { page: data.page });
    case DmSvBacDaoTaoUpdate:
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
T.initPage('pageDmSvBacDaoTao');
export function getDmSvBacDaoTaoPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmSvBacDaoTao', pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/danh-muc/dao-tao/bac-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, {
      condition: pageCondition
    }, data => {
      if (data.error) {
        T.notify('Lấy danh sách bậc đào tạo bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
        dispatch({ type: DmSvBacDaoTaoGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách bậc đào tạo bị lỗi!', 'danger'));
  };
}

export function getDmSvBacDaoTao(ma, done) {
  return () => {
    const url = `/api/danh-muc/dao-tao/bac-dao-tao/item/${ma}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy thông tin bậc đào tạo bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.item);
      }
    }, error => console.error(`GET: ${url}.`, error));
  };
}

export function createDmSvBacDaoTao(item, done) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/bac-dao-tao';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo bậc đào tạo bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        if (done) done(data.error);
      } else {
        T.notify('Tạo mới thông tin bậc đào tạo thành công!', 'success');
        dispatch(getDmSvBacDaoTaoPage());
        if (done) done(data);
      }
    }, () => T.notify('Tạo bậc đào tạo bị lỗi!', 'danger'));
  };
}

export function deleteDmSvBacDaoTao(ma) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/bac-dao-tao';
    T.delete(url, { maBac: ma }, data => {
      if (data.error) {
        T.notify('Xóa danh mục bậc đào tạo bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDmSvBacDaoTaoPage());
      }
    }, () => T.notify('Xóa bậc đào tạo bị lỗi!', 'danger'));
  };
}

export function updateDmSvBacDaoTao(ma, changes, done) {
  return dispatch => {
    const url = '/api/danh-muc/dao-tao/bac-dao-tao';
    T.put(url, { maBac: ma, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin bậc đào tạo bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin bậc đào tạo thành công!', 'success');
        dispatch(getDmSvBacDaoTaoPage());
        if (done) done();
      }
    }, () => T.notify('Cập nhật thông tin bậc đào tạo bị lỗi!', 'danger'));
  };
}

export function changeDmSvBacDaoTao(item) {
  return { type: DmSvBacDaoTaoUpdate, item };
}

export const SelectAdapter_DmSvBacDaoTao = {
  ajax: true,
  url: '/api/danh-muc/dao-tao/bac-dao-tao/page/1/20',
  data: params => ({ condition: params.term }),
  processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: item.ten })) : [] }),
  getOne: getDmSvBacDaoTao,
  processResultOne: response => response && ({ value: response.ma, text: response.ma + ': ' + response.ten }),
};