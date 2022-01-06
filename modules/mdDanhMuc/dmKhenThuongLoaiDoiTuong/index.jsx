//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhenThuongLoaiDoiTuong from './redux';

export default {
    redux: {
        dmKhenThuongLoaiDoiTuong,
    },
    routes: [
        {
            path: '/user/danh-muc/khen-thuong-loai-doi-tuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};