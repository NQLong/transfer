//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhenThuongChuThich from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmKhenThuongChuThich, }
    },
    routes: [
        {
            path: '/user/danh-muc/khen-thuong-chu-thich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};