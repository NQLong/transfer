import T from 'view/js/common';

const ClusterGetAll = 'ClusterGetAll';

export default function clusterReducer(state = {}, data) {
    switch (data.type) {
        case ClusterGetAll:
            return Object.assign({}, state, data.state);

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getClusterAll() {
    return dispatch => {
        const url = '/api/cluster/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cluster bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: ClusterGetAll, state: data.services || {} });
            }
        }, error => console.error(error) || T.notify('Lấy cluster bị lỗi!', 'danger'));
    };
}

export function createCluster(serviceName, done) {
    return dispatch => {
        const url = '/api/cluster';
        T.post(url, { serviceName }, data => {
            if (data.error) {
                T.notify('Tạo cluster bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch();
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo cluster bị lỗi!', 'danger'));
    };
}

export function resetCluster(serviceName, id, done) {
    return dispatch => {
        if (id) {
            if (typeof id == 'function') {
                done = id;
                id = null;
            }
        }

        const url = '/api/cluster';
        T.put(url, { serviceName, id }, data => {
            if (data.error) {
                T.notify('Cập nhật cluster bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật cluster thành công!', 'success');
                dispatch();
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật cluster bị lỗi!', 'danger'));
    };
}

export function deleteCluster(serviceName, id) {
    return dispatch => {
        const url = '/api/cluster';
        T.delete(url, { serviceName, id }, data => {
            if (data.error) {
                T.notify('Xóa cluster bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa cluster thành công!', 'error', false, 800);
                dispatch();
            }
        }, error => console.error(error) || T.notify('Xóa cluster bị lỗi!', 'danger'));
    };
}


export function applyServiceImage(serviceName, filename, done) {
    return () => {
        const url = '/api/cluster/image';
        T.put(url, { serviceName, filename }, data => {
            if (data.error) {
                T.notify('Triển khai image bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Triển khai image thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Triển khai image bị lỗi!', 'danger'));
    };
}

export function deleteServiceImage(serviceName, filename) {
    return dispatch => {
        const url = '/api/cluster/image';
        T.delete(url, { serviceName, filename }, data => {
            if (data.error) {
                T.notify('Xóa image bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa image thành công!', 'error', false, 800);
                dispatch();
            }
        }, error => console.error(error) || T.notify('Xóa image bị lỗi!', 'danger'));
    };
}

export function getAllLogs(done) {
    return () => {
        const url = '/api/cluster/list-logs';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách logs bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.list);
            }
        }, error => console.error(error) || T.notify('Lấy danh sách logs bị lỗi!', 'danger'));
    };
}

export function watchLogs(path) {
    return () => {
        const url = '/api/cluster/logs';
        T.get(url, { path }, data => {
            if (data.error) {
                T.notify('Watch logs bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            }
        }, error => console.error(error) || T.notify('Watch logs bị lỗi!', 'danger'));
    };
}

export function unWatchLogs(done) {
    return () => {
        const url = '/api/cluster/logs';
        T.post(url, data => {
            if (data.error) {
                T.notify('Unwatch logs bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done();
            }
        }, error => console.error(error) || T.notify('Unwatch logs bị lỗi!', 'danger'));
    };
}