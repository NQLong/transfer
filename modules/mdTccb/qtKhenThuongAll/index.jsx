//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtKhenThuongAll from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtKhenThuongAll }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/khen-thuong-all/group_dt/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/khen-thuong-all',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/khen-thuong-all',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};
