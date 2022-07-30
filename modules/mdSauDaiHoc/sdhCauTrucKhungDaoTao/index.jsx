//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhCauTrucKhungDaoTao from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhCauTrucKhungDaoTao }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/cau-truc-khung-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sau-dai-hoc/cau-truc-khung-dao-tao/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};