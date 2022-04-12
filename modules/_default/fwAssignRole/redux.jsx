import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AssignRoleUpdate = 'AssignRole:Update';
const AssignRoleGetRolesList = 'AssignRole:GetRolesList';
const AssignRoleGetItem = 'AssignRole:GetItem';

export default function assignRoleReducer(state = null, data) {
     switch (data.type) {
          case AssignRoleGetRolesList:
               return Object.assign({}, state, { items: data.items });
          case AssignRoleGetItem:
               return Object.assign({}, state, { item: data.item });
          case AssignRoleUpdate: {
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
               if (updatedPage.list) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                         if (updatedPage.list[i].id == updatedItem.id) {
                              updatedPage.list.splice(i, 1, updatedItem);
                              break;
                         }
                    }
               }
               return Object.assign({}, state, { items: updatedItems, page: updatedPage });
          }

          default:
               return state;
     }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getRolesList(tenDonVi, done) {
     return dispatch => {
          const url = `/api/assign-role/list/${tenDonVi}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy danh sách quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                    console.error(`GET: ${url}.`, data.error);
               } else {
                    dispatch({ type: AssignRoleGetRolesList, items: data.items });
               }
               done && done(data);
          }, error => console.error(`GET: ${url}.`, error));
     };
}

export function getAssignRole(nguoiDuocGan, donVi, done) {
     return dispatch => {
          const url = `/api/assign-role/${nguoiDuocGan}`;
          T.get(url, { donVi }, data => {
               if (data.error) {
                    T.notify('Lấy thông tin gán quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                    console.error(`GET: ${url}.`, data.error);
               } else {
                    dispatch({ type: AssignRoleGetItem, item: data });
               }
               done && done(data);
          }, error => console.error(`GET: ${url}.`, error));
     };
}

export function createAssignRole(assignRole, done) {
     return () => {
          const url = '/api/assign-role';
          T.post(url, { assignRole }, data => {
               if (data.error) {
                    T.notify('Tạo gán quyền bị lỗi!', 'danger');
                    console.error(`POST: ${url}. ${data.error}`);
               } else {
                    T.notify('Lưu thông tin gán quyền thành công!', 'success');
                    done && done(data);
               }
          }, () => T.notify('Tạo gán quyền bị lỗi!', 'danger'));
     };
}

export function updateAssignRole(id, item, done) {
     return () => {
          const url = '/api/assign-role';
          T.put(url, { id, item }, data => {
               if (data.error || item == null) {
                    T.notify('Cập nhật thông tin gán quyền bị lỗi' + (data.error.message && (':<br>' + data.error.message)), 'danger');
                    console.error(`PUT: ${url}.`, data);
                    done && done(data);
               } else {
                    T.notify('Cập nhật thông tin gán quyền thành công!', 'success');
                    done && done(data);
               }
          }, error => T.notify('Cập nhật thông tin gán quyền bị lỗi' + (error.error.message && (':<br>' + error.error.message)), 'danger'));
     };
}

export function deleteAssignRole(item, done) {
     return () => {
          const url = '/api/assign-role';
          T.delete(url, { item }, data => {
               if (data.error) {
                    T.notify('Xóa thông tin gán quyền bị lỗi' + (data.error.message && ('<br>' + data.error.message)), 'danger');
                    console.error(`DELETE: ${url}`);
                    done && done(data);
               } else {
                    T.notify('Xóa thông tin gán quyền thành công!', 'success');
                    done && done(data);
               }
          }, error => T.notify('Xóa thông tin gán quyền bị lỗi' + (error.message && ('<br>' + error.message)), 'danger')
          );
     };
}