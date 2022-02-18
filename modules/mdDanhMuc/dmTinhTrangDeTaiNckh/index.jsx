//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangDeTaiNckh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangDeTaiNckh }
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-de-tai-nckh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};