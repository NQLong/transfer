//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtGiaiThuong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtGiaiThuong }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/giai-thuong/group_gt/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/giai-thuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
