import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_QUESTIONS_LIST = 'question:getQuestionsList';
const GET_QUESTIONS_PAGE = 'question:getQuestionsInPage';
const GET_QUESTIONS_ALL = 'question:getQuestionsAll';

export default function questionReducer(state = {}, data) {
     switch (data.type) {
          case GET_QUESTIONS_LIST:
               return Object.assign({}, state, { questions: data.questions });

          case GET_QUESTIONS_PAGE: {
               let list = state.list ? state.list : [];
               // let pageNumber = data.from;
               // for (let i = 0; i < data.list.length; i++, from++) {
               //      list[from] = data.list[i];
               // }

               return Object.assign({}, state, { list, totalItem: data.totalItem });
          }

          case GET_QUESTIONS_ALL: {
               return { ...state, list: data.list };
          }

          default:
               return state;
     }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function getQuestionsList(formId, done) {
     return dispatch => {
          const url = `/api/questions/${formId}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                    console.error('GET: ' + url + '.', data.error);
               } else {
                    dispatch({ type: GET_QUESTIONS_LIST, questions: data.item ? data.item : [] });
                    done && done(data.item);
               }
          }, error => {
               console.error('GET: ' + url + '.', error);
          });
     };
}

export function getQuestionInPageByUser(formId, pageNumber, pageSize, done) {
     return dispatch => {
          const url = `/api/home/questions-page/${formId}/${pageNumber}/${pageSize}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
               } else {
                    dispatch({ type: GET_QUESTIONS_PAGE, list: data.list, pageNumber, pageSize, totalItem: data.totalItem });
                    done && done(data);
               }
          }, () => T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger'));
     };
}

export function getQuestionAllByUser(formId, done) {
     return dispatch => {
          const url = `/api/home/questions-page/all/${formId}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
               } else {
                    dispatch({ type: GET_QUESTIONS_ALL, list: data.list });
                    done && done(data);
               }
          }, () => T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger'));
     };
}

export function createQuestion(id, data, done) {
     return dispatch => {
          const url = `/api/question/${id}`;
          T.post(url, { data }, data => {
               if (data.error) {
                    T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                    console.error('POST: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(id));
                    done && done(data.item);
               }
          }, error => console.error('POST: ' + url + '.', error));
     };
}

export function updateQuestion(id, data, formId, done) {
     return dispatch => {
          const url = '/api/question';
          T.put(url, { id, data }, data => {
               if (data.error) {
                    T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                    console.error('PUT: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('PUT: ' + url + '.', error));
     };
}

export function swapQuestion(id, formId, isMoveUp, done) {
     return dispatch => {
          const url = '/api/question/swap';
          T.put(url, { id, formId, isMoveUp }, data => {
               if (data.error) {
                    T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                    console.error('PUT: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('PUT: ' + url + '.', error));
     };
}

export function deleteQuestion(id, formId, done) {
     return dispatch => {
          const url = '/api/question';
          T.delete(url, { id }, data => {
               if (data.error) {
                    T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                    console.error('DELETE: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('DELETE: ' + url + '.', error));
     };
}
