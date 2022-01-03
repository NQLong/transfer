//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtKyLuat from './redux';

export default {
    redux: {
        qtKyLuat,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/ky-luat/group_kl/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
