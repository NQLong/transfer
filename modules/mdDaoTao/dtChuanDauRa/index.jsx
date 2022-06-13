//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtChuanDauRa from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtChuanDauRa }
    },
    routes: [
        {
            path: '/user/dao-tao/chuan-dau-ra',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};