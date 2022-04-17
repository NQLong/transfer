//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDangKyMoMon from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDangKyMoMon }
    },
    routes: [
        {
            path: '/user/dao-tao/dang-ky-mo-mon/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/dao-tao/dang-ky-mo-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ]
};