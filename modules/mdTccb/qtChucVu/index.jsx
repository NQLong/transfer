//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtChucVu from './redux';

export default {
    redux: {
        qtChucVu,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/chuc-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/chuc-vu/group_cv/:loaiDoiTuong/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};