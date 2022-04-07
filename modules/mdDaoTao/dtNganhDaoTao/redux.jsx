import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DtNganhDaoTaoGetPage = 'DtNganhDaoTao:GetPage';
const DtNganhDaoTaoUpdate = 'DtNganhDaoTao:Update';

export default function DtNganhDaoTaoReducer(state = null, data) {
  switch (data.type) {
    case DtNganhDaoTaoGetPage:
      return Object.assign({}, state, { page: data.page });
    case DtNganhDaoTaoUpdate:
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
T.initPage('pageDtNganhDaoTao');
export function getDtNganhDaoTaoPage(pageNumber, pageSize, done) {
  const page = T.updatePage('pageDtNganhDaoTao', pageNumber, pageSize);
  return dispatch => {
    const url = `/api/pdt/nganh-dao-tao/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, data => {
      if (data.error) {
        T.notify('Lấy danh sách ngành bị lỗi!', 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
        dispatch({ type: DtNganhDaoTaoGetPage, page: data.page });
      }
    }, () => T.notify('Lấy danh sách ngành bị lỗi!', 'danger'));
  };
}

export function getDtNganhDaoTao(maNganh, done) {
  return () => {
    const url = `/api/pdt/nganh-dao-tao/item/${maNganh}`;
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

export function createDtNganhDaoTao(item, done) {
  return dispatch => {
    const url = '/api/pdt/nganh-dao-tao';
    T.post(url, { data: item }, data => {
      if (data.error) {
        T.notify(data.error.message || 'Tạo ngành bị lỗi', 'danger');
        console.error(`POST: ${url}.`, data.error);
        if (done) done(data.error);
      } else {
        T.notify('Tạo mới thông tin ngành thành công!', 'success');
        dispatch(getDtNganhDaoTaoPage());
        if (done) done(data);
      }
    }, () => T.notify('Tạo ngành bị lỗi!', 'danger'));
  };
}

export function deleteDtNganhDaoTao(maNganh) {
  return dispatch => {
    const url = '/api/pdt/nganh-dao-tao';
    T.delete(url, { maNganh: maNganh }, data => {
      if (data.error) {
        T.notify('Xóa danh mục ngành bị lỗi!', 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Danh mục đã xóa thành công!', 'success', false, 800);
        dispatch(getDtNganhDaoTaoPage());
      }
    }, () => T.notify('Xóa ngành bị lỗi!', 'danger'));
  };
}

export function updateDtNganhDaoTao(maNganh, changes, done) {
  return dispatch => {
    const url = '/api/pdt/nganh-dao-tao';
    T.put(url, { maNganh, changes }, data => {
      if (data.error || changes == null) {
        T.notify(data.error.message || 'Cập nhật thông tin ngành bị lỗi', 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin ngành thành công!', 'success');
        dispatch(getDtNganhDaoTaoPage());
        if (done) done();
      }
    }, () => T.notify('Cập nhật thông tin ngành bị lỗi!', 'danger'));
  };
}

export function changeDtNganhDaoTao(item) {
  return { type: DtNganhDaoTaoUpdate, item };
}

export const SelectAdapter_DtNganhDaoTao = {
  ajax: true,
  url: '/api/pdt/nganh-dao-tao/page/1/20',
  data: params => ({ condition: params.term }),
  processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.maNganh, text: item.tenNganh })) : [] }),
  fetchOne: (maNganh, done) => (getDtNganhDaoTao(maNganh, item => done && done({ id: item.maNganh, text: item.tenNganh })))(),

};