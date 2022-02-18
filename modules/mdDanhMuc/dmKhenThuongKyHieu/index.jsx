//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhenThuongKyHieu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmKhenThuongKyHieu, }
    },
    routes: [
        {
            path: '/user/danh-muc/khen-thuong-ky-hieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};