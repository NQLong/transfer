//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmThu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmThu }
    },
    routes: [
        {
            path: '/user/dao-tao/thu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};