import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

const DtDsMonMoGetPage = 'DtDsMonMo:GetPage';
const DtDsMonMoUpdate = 'DtDsMonMo:Update';
// const DtDsMonMoGetItem = 'DtDsMonMo:GetItem';

export default function dtDsMonMoReducer(state = null, data) {
     switch (data.type) {
          case DtDsMonMoGetPage:
               return Object.assign({}, state, { page: data.page });
          // case DtDsMonMoGetItem:
          //     return Object.assign({}, state, { item: data.item });
          case DtDsMonMoUpdate:
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

export const PageName = 'pageDtDsMonMo';
T.initPage(PageName);
export function getDtDsMonMoPage(pageNumber, pageSize, pageCondition, donVi, done) {
     const page = T.updatePage(PageName, pageNumber, pageSize, pageCondition);
     return dispatch => {
          const url = `/api/dao-tao/danh-sach-mon-mo/page/${page.pageNumber}/${page.pageSize}`;
          T.get(url, { condition: pageCondition, donVi }, data => {
               if (data.error) {
                    T.notify('Lấy danh sách môn mở bị lỗi!', 'danger');
                    console.error(`GET ${url}. ${data.error}`);
               } else {
                    dispatch({ type: DtDsMonMoGetPage, page: data.page });
                    done && done();
               }
          });
     };
}

export function getDsMonMo(id, donVi, done) {
     return () => {
          const url = `/api/dao-tao/danh-sach-mon-mo/${donVi}/${id}`;
          T.get(url, {}, data => {
               if (data.error) {
                    T.notify('Lấy danh sách môn mở bị lỗi!', 'danger');
                    console.error(`GET ${url}. ${data.error}`);
               } else {
                    done && done(data.items);
               }
          });
     };
}

