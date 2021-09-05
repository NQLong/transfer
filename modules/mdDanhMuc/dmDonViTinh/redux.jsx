import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmDonViTinhGetAll = 'DmDonViTinh:GetAll';
const DmDonViTinhGetPage = 'DmDonViTinh:GetPage';
const DmDonViTinhUpdate = 'DmDonViTinh:Update';

export default function DmDonViTinhReducer(state = null, data) {
  switch (data.type) {
    case DmDonViTinhGetAll:
      return Object.assign({}, state, { items: data.items });

    case DmDonViTinhGetPage:
      return Object.assign({}, state, { page: data.page });

    case DmDonViTinhUpdate:
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
export const PageName = 'pageDmDonViTinh';
T.initPage(PageName);

export function getDmDonViTinhPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
  return (dispatch) => {
    const url = `/api/danh-muc/don-vi-tinh/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: page.pageCondition }, (data) => {
      if (data.error) {
        T.notify('Lấy danh sách đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (page.pageCondition) data.page.pageCondition = page.pageCondition;
        if (done) done(data.page);
        dispatch({ type: DmDonViTinhGetPage, page: data.page });
      }
    }, (error) => T.notify('Lấy danh sách đơn vị tính bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
  };
}

export function getDmDonViTinhAll(done) {
  return (dispatch) => {
    const url = '/api/danh-muc/don-vi-tinh/all';
    T.get(url, (data) => {
      if (data.error) {
        T.notify('Lấy danh sách đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else {
        if (done) done(data.items);
        dispatch({ type: DmDonViTinhGetAll, items: data.items ? data.items : [] });
      }
    }, (error) => T.notify('Lấy danh sách đơn vị tính bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
  };
}

export function getDmDonViTinh(ma, done) {
  return (dispatch) => {
    const url = `/api/danh-muc/don-vi-tinh/item/${ma}`;
    T.get(url, (data) => {
      if (data.error) {
        T.notify('Lấy thông tin đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`GET: ${url}.`, data.error);
      } else if (done) {
        done(data.item);
      }
    }, (error) => console.error(`GET: ${url}.`, error));
  };
}

export function createDmDonViTinh(item, done) {
  return (dispatch) => {
    const url = '/api/danh-muc/don-vi-tinh';
    T.post(url, { item }, (data) => {
      if (data.error) {
        T.notify('Tạo đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`POST: ${url}.`, data.error);
      } else {
        dispatch(getDmDonViTinhPage());
        if (done) done(data);
      }
    }, (error) => T.notify('Tạo đơn vị tính bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
  };
}

export function updateDmDonViTinh(ma, changes, done) {
  return (dispatch) => {
    const url = '/api/danh-muc/don-vi-tinh';
    T.put(url, { ma, changes }, (data) => {
      if (data.error || changes == null) {
        T.notify('Cập nhật thông tin đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`PUT: ${url}.`, data.error);
        done && done(data.error);
      } else {
        T.notify('Cập nhật thông tin đơn vị tính thành công!', 'success');
        dispatch(getDmDonViTinhPage());
      }
    }, (error) => T.notify('Cập nhật thông tin đơn vị tính bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
  };
}

export function deleteDmDonViTinh(ma) {
  return (dispatch) => {
    const url = '/api/danh-muc/don-vi-tinh';
    T.delete(url, { ma }, (data) => {
      if (data.error) {
        T.notify('Xóa danh mục đơn vị tính bị lỗi' + (data.error.message && ':<br>' + data.error.message), 'danger');
        console.error(`DELETE: ${url}.`, data.error);
      } else {
        T.alert('Khoa đã xóa thành công!', 'success', false, 800);
        dispatch(getDmDonViTinhPage());
      }
    }, (error) => T.notify('Xóa đơn vị tính bị lỗi' + (error.error.message && ':<br>' + data.error.message), 'danger'));
  };
}

export function changeDmDonViTinh(item) {
  return { type: DmDonViTinhUpdate, item };
}

export function createDmDonViTinhByUpload(item, done) {
  return (dispatch) => {
    const url = '/api/danh-muc/don-vi-tinh/createFromFile';
    T.post(url, { item }, (data) => {
      if (data.error) {
        console.error(`POST: ${url}.`, data.error);
      }
      dispatch(getDmDonViTinhPage());
      if (done) done(data);
    }, (error) => T.notify('Tạo danh mục đơn vị tính bị lỗi!', 'danger'));
  };
}

export const SelectAdapter_DmDonViTinh = {
  ajax: true,
  url: '/api/danh-muc/don-vi-tinh/page/1/20',
  data: (params) => ({ condition: params.term }),
  processResults: (response) => ({
    results: response && response.page && response.page.list ? response.page.list.map((item) => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [],
  }),
  getOne: getDmDonViTinh,
  processResultOne: (response) => response && { value: response.ma, text: response.ma + ': ' + response.ten },
};
