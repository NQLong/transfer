//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangSinhVien from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangSinhVien, }
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};