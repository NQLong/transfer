//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangHonNhan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangHonNhan }
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-hon-nhan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 