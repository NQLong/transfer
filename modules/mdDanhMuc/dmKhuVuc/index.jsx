//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhuVuc from './redux';

export default {
    redux: {
        dmKhuVuc
    },
    routes: [
        {
            path: '/user/danh-muc/khu-vuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};