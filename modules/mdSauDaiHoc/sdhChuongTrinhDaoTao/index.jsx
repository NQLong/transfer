//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhChuongTrinhDaoTao from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhChuongTrinhDaoTao }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/chuong-trinh-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/chuong-trinh-dao-tao/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        },
        {
            path: '/user/sau-dai-hoc/ke-hoach-dao-tao/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminKeHoachPage') })
        }
    ],
};