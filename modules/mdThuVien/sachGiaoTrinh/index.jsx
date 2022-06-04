//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sachGiaoTrinh from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { sachGiaoTrinh }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/sach-giao-trinh/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/sach-giao-trinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sach-giao-trinh',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};
