//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sachGiaoTrinh from './redux';

export default {
    redux: {
        sachGiaoTrinh,
    },
    routes: [
        {
            path: '/user/tccb/sach-giao-trinh/group_sgt/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/sach-giao-trinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
