//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCoSo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmCoSo, }
    },
    routes: [
        {
            path: '/user/danh-muc/co-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/co-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};