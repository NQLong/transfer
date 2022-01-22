//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmBoMon from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmBoMon },
    },
    routes: [
        {
            path: '/user/dm-bo-mon/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/dm-bo-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};