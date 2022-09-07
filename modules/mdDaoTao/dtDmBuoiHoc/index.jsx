//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDmBuoiHoc from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtDmBuoiHoc }
    },
    routes: [
        {
            path: '/user/dao-tao/buoi-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};