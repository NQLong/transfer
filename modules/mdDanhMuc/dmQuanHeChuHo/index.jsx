//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmQuanHeChuHo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmQuanHeChuHo }
    },
    routes: [
        {
            path: '/user/danh-muc/quan-he-chu-ho',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};