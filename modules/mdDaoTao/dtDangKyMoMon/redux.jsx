import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const DtDangKyMoMonGetPage = 'DtDangKyMoMon:GetPage';
const DtDangKyMoMonUpdate = 'DtDangKyMoMon:Update';
// const DtDangKyMoMonGetItem = 'DtDangKyMoMon:GetItem';

export default function dtDangKyMoMonReducer(state = null, data) {
  switch (data.type) {
    case DtDangKyMoMonGetPage:
      return Object.assign({}, state, { page: data.page });
    // case DtDangKyMoMonGetItem:
    //     return Object.assign({}, state, { item: data.item });
    case DtDangKyMoMonUpdate:
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

export const PageName = 'pageDtDangKyMoMon';
T.initPage(PageName);
export function getDtDangKyMoMonPage(pageNumber, pageSize, pageCondition, donVi, done) {
  const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
  return dispatch => {
    const url = `/api/dao-tao/dang-ky-mo-mon/page/${page.pageNumber}/${page.pageSize}`;
    T.get(url, { condition: pageCondition, donVi }, data => {
      if (data.error) {
        T.notify('Lấy danh sách đăng ký mở môn bị lỗi!', 'danger');
        console.error(`GET ${url}. ${data.error}`);
      } else {
        dispatch({ type: DtDangKyMoMonGetPage, page: data.page });
        done && done();
      }
    });
  };
}

