//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtKyLuat from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtKyLuat }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/ky-luat/group_kl/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/ky-luat',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
