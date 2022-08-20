//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmThoiGianDaoTao from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmThoiGianDaoTao }
    },
    routes: [
        {
            path: '/user/dao-tao/thoi-gian-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};