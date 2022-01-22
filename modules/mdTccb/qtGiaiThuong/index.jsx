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
            path: '/user/tccb/qua-trinh/giai-thuong/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/giai-thuong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
