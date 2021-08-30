//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCoSo from './redux';

export default {
    redux: {
        dmCoSo,
    },
    routes: [
        {
            path: '/user/danh-muc/co-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};