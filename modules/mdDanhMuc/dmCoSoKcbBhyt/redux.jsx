import T from 'view/js/common';


// Reducer ------------------------------------------------------------------------------------------------------------
const DmCoSoKcbGetAll = 'DmCoSoKcb:GetAll';
const DmCoSoKcbGetPage = 'DmCoSoKcb:GetPage';
const DmCoSoKcbUpdate = 'DmCoSoKcb:Update';

export default function dmCoSoKcbReducer(state = null, data) {
  switch (data.type) {
    case DmCoSoKcbGetAll:
      return Object.assign({}, state, { items: data.items });
    case DmCoSoKcbGetPage:
      return Object.assign({}, state, { page: data.page });
    default:
      return state;
  }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDmCoSoKcbBhyt(ma, done) {
  return () => {
    const url = `/api/danh-muc/co-so-kcb-bhyt/item/${ma}`;
    T.get(url, (result) => {
      if (result.error) {
        T.notify('Lỗi lấy thông tin cơ sở KCB BHYT', 'danger');
      } else {
        done && done(result.item);
      }
    });
  };
}

export function getDmCoSoKcbAll(done) {
  return (dispatch) => {
    const url = '/api/danh-muc/co-so-kham-chua-benh/all';
    T.get(url, (data) => {
        if (data.error) {
          T.notify('Lấy danh sách cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger');
          console.error(`GET: ${url}.`, data.error);
        } else {
          if (done) done(data.items);
          dispatch({
            type: DmCoSoKcbGetAll,
            items: data.items ? data.items : [],
          });
        }
      },
      () => T.notify('Lấy danh sách cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger')
    );
  };
}

T.initPage('pageDmCoSoKcb');
export function getDmCoSoKcbPage(pageNumber, pageSize, pageCondition, done) {
  const page = T.updatePage('pageDmCoSoKcb', pageNumber, pageSize);
  return (dispatch) => {
    const url = `/api/danh-muc/co-so-kham-chua-benh/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, (data) => {
        if (data.error) {
          T.notify('Lấy danh sách cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger');
          console.error(`GET: ${url}.`, data.error);
        } else {
          if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
          dispatch({ type: DmCoSoKcbGetPage, page: data.page });
        }
      },
      () => T.notify('Lấy danh sách cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger')
    );
  };
}

export function getDmCoSoKcb(ma, done) {
  return () => {
    const url = `/api/danh-muc/co-so-kham-chua-benh/item/${ma}`;
    T.get(url, (data) => {
        if (data.error) {
          T.notify('Lấy thông tin cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger');
          console.error(`GET: ${url}.`, data.error);
        } else {
          if (done) done(data.item);
        }
      },
      (error) => {
        console.error(`GET: ${url}.`, error);
      }
    );
  };
}

export function createDmCoSoKcb(item, done) {
  return (dispatch) => {
    const url = '/api/danh-muc/co-so-kham-chua-benh';
    T.post(url, { item }, (data) => {
        if (data.error) {
          T.notify(data.error.message ? data.error.message : 'Tạo mới cơ sở khám chữa bệnh bị lỗi', 'danger');
          console.error(`POST: ${url}.`, data.error);
        } else {
          T.notify('Tạo cơ sở khám chữa bệnh BHYT thành công!', 'success');
          dispatch(getDmCoSoKcbPage());
          if (done) done(data);
        }
      },
      () => T.notify('Tạo cơ sở cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger')
    );
  };
}

export function deleteDmCoSoKcb(ma) {
  return (dispatch) => {
    const url = '/api/danh-muc/co-so-kham-chua-benh';
    T.delete(url, { ma }, (data) => {
        if (data.error) {
          T.notify('Xóa danh mục bị lỗi!', 'danger');
          console.error(`DELETE: ${url}.`, data.error);
        } else {
          T.alert('Xóa cơ sở khám chữa bệnh BHYT thành công!', 'success', false, 800);
          dispatch(getDmCoSoKcbPage());
        }
      },
      () => T.notify('Xóa cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger')
    );
  };
}

export function updateDmCoSoKcb(ma, changes, done) {
  return (dispatch) => {
    const url = '/api/danh-muc/co-so-kham-chua-benh';
    T.put(url, { ma, changes }, (data) => {
        if (data.error || changes == null) {
          T.notify('Cập nhật thông tin cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger');
          console.error(`PUT: ${url}.`, data.error);
          done && done(data.error);
        } else {
          T.notify('Cập nhật thông tin cơ sở khám chữa bệnh BHYT thành công!', 'success');
          done && done(data.item);
          dispatch(getDmCoSoKcbPage());
        }
      },
      () => T.notify('Cập nhật thông tin cơ sở khám chữa bệnh BHYT bị lỗi!', 'danger')
    );
  };
}

export function changeDmCoSoKcb(item) {
  return { type: DmCoSoKcbUpdate, item };
}

export const SelectAdapter_DmCoSoKcbBhyt = {
  ajax: true,
  url: '/api/danh-muc/co-so-kham-chua-benh/page/1/50',
  data: (params) => ({ searchTerm: params.term }),
  processResults: (response) => ({ results: response && response.items ? response.items.map((item) => ({id: item.ma, text: `[${item.ma}] ${item.ten}: ${item.diaChi}`, ten: item.ten, loaiDangKy: item.loaiDangKy,})) : [],}),
  fetchOne: (ma, done) => getDmCoSoKcb(ma, (item) => item && done && done({ id: item.ma, text: `[${item.ma}] ${item.ten}: ${item.diaChi}` }))(),
};
