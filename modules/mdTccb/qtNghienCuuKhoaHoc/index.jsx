//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghienCuuKhoaHoc from './redux';

export default {
    redux: {
        qtNghienCuuKhoaHoc,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/group_nckh/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
