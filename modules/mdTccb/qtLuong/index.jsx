//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtLuong from './redux';

export default {
    redux: {
        qtLuong,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/luong/group/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};