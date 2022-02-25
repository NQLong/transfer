//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTonGiao from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTonGiao }
    },
    routes: [
        {
            path: '/user/danh-muc/ton-giao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};