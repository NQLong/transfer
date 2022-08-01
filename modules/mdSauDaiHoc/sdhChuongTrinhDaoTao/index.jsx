//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtChuongTrinhDaoTao from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { dtChuongTrinhDaoTao }
    },
    routes: [
        {
            path: '/user/dao-tao/chuong-trinh-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/chuong-trinh-dao-tao/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};