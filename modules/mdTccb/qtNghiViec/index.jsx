//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiViec from './redux';

export default {
    redux: {
        qtNghiViec,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-viec',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-viec/group/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
