import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DmMonHocGetAll = 'DmMonHoc:GetAll';
const DmMonHocGetPage = 'DmMonHoc:GetPage';
const DmMonHocUpdate = 'DmMonHoc:Update';
const DmMonHocDelete = 'DmMonHoc:Delete';
const DmMonHocCreate = 'DmMonHoc:Create';

export default function dmMonHocReducer(state = null, data) {
     switch (data.type) {
          case DmMonHocGetAll:
               return Object.assign({}, state, { items: data.items });
          case DmMonHocGetPage:
               return Object.assign({}, state, { page: data.page });
          case DmMonHocUpdate:
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
                                   updatedPage.list.splice(i, 1);
                                   break;
                              }
                         }
                    }
                    return Object.assign({}, state, { items: updatedItems, page: updatedPage });
               } else {
                    return null;
               }
          case DmMonHocDelete:
               if (state) {
                    let updatedPage = Object.assign({}, state.page),
                         deletedItem = data.item;
                    if (updatedPage) {
                         for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                              if (updatedPage.list[i].ma == deletedItem.ma) {
                                   console.log(deletedItem);
                                   updatedPage.list.splice(i, 1, deletedItem);
                                   break;
                              }
                         }
                    }
                    return Object.assign({}, state, { page: updatedPage });
               } else {
                    return null;
               }
          case DmMonHocCreate:
               if (state) {
                    let updatedPage = Object.assign({}, state.page),
                         createdItem = data.item;
                    if (updatedPage) {
                         updatedPage.list.unshift(createdItem);
                    }
                    return Object.assign({}, state, { page: updatedPage });
               } else {
                    return null;
               }
          default:
               return state;
     }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDmMonHocAll(condition, done) {
     if (typeof condition === 'function') {
          done = condition;
          condition = {};
     }
     return dispatch => {
          const url = '/api/dao-tao/mon-hoc/all';
          T.get(url, { condition }, data => {
               if (data.error) {
                    T.notify('Lấy danh sách môn học bị lỗi', 'danger');
                    console.error(`GET ${url}. ${data.error}`);
               } else {
                    if (done) done(data.items);
                    dispatch({ type: DmMonHocGetAll, items: data.items ? data.items : [] });
               }
          });
     };
}

T.initPage('pageDmMonHoc');
export function getDmMonHocPage(pageNumber, pageSize, pageCondition) {
     const page = T.updatePage('pageDmMonHoc', pageNumber, pageSize, pageCondition);
     return dispatch => {
          const url = `/api/dao-tao/mon-hoc/page/${page.pageNumber}/${page.pageSize}`;
          T.get(url, { searchTerm: pageCondition?.searchTerm, donVi: pageCondition?.donVi }, data => {
               if (data.error) {
                    T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                    console.error(`GET ${url}. ${data.error}`);
               } else {
                    dispatch({ type: DmMonHocGetPage, page: data.page });
               }
          });
     };
}

export function createDmMonHoc(item, done) {
     return dispatch => {
          const url = '/api/dao-tao/mon-hoc';
          T.post(url, { item }, data => {
               if (data.error) {
                    T.notify('Tạo môn học bị lỗi!', 'danger');
                    console.error(`POST ${url}. ${data.error}`);
               } else {
                    T.notify('Tạo môn học thành công!', 'success');
                    dispatch({ type: DmMonHocCreate, item: data.item });
                    if (done) done(data.item);
               }
          });
     };
}

export function getDmMonHoc(ma, done) {
     return () => {
          const url = `/api/dao-tao/mon-hoc/item/${ma}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy thông tin môn học bị lỗi!', 'danger');
                    console.error(`GET: ${url}.`, data.error);
               } else {
                    if (done) done(data.item);
               }
          }, error => console.error(`GET: ${url}.`, error));
     };
}


export function deleteDmMonHoc(ma) {
     return dispatch => {
          const url = '/api/dao-tao/mon-hoc';
          T.delete(url, { ma }, data => {
               if (data.error) {
                    T.notify('Xóa môn học bị lỗi!', 'danger');
                    console.error(`DELETE: ${url}.`, data.error);
               } else {
                    T.alert('Môn học đã xóa thành công!', 'success', false, 800);
                    dispatch({ type: DmMonHocDelete, item: { ma } });
               }
          }, () => T.notify('Xóa môn học bị lỗi!', 'danger'));
     };
}

export function updateDmMonHoc(ma, changes, done) {
     return dispatch => {
          const url = '/api/dao-tao/mon-hoc';
          T.put(url, { ma, changes }, data => {
               if (data.error) {
                    T.notify('Cập nhật môn học bị lỗi!', 'danger');
                    console.error(`PUT ${url}. ${data.error}`);
                    done && done(data.error);
               } else {
                    T.notify('Cập nhật thông tin môn học thành công!', 'success');
                    dispatch({ type: DmMonHocUpdate, item: data.item });
                    done && done();
               }
          }, () => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
     };
}

export function changeDmMonHoc(item) {
     return { type: DmMonHocUpdate, item };
}

export const SelectAdapter_DmMonHoc = {
     ajax: true,
     url: '/api/dao-tao/mon-hoc/page/1/20',
     data: params => ({ searchTerm: params.term || '' }),
     processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
     fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))(),
     fetchOneItem: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, item: item })))(),
};

export const SelectAdapter_DmMonHocFaculty = (donVi) => {
     return {
          ajax: true,
          url: '/api/dao-tao/mon-hoc/page/1/20',
          data: params => ({ searchTerm: params.term || '', donViFilter: donVi }),
          processResults: response => ({ results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] }),
          fetchOne: (ma, done) => (getDmMonHoc(ma, item => done && done({ id: item.ma, text: `${item.ma}: ${item.ten}` })))(),

     };
};