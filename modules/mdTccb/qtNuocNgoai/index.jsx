//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNuocNgoai from './redux';

export default {
    redux: {
        qtNuocNgoai,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nuoc-ngoai/group_nn/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
