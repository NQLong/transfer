//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmGioiTinh from './redux';

export default {
    redux: {
        dmGioiTinh,
    },
    routes: [
        {
            path: '/user/danh-muc/gioi-tinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};