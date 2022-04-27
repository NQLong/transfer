//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtCauTrucKhungDaoTao from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtCauTrucKhungDaoTao }
    },
    routes: [
        {
            path: '/user/dao-tao/cau-truc-khung-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/cau-truc-khung-dao-tao/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};