//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChau from './redux';

export default {
    redux: {
        dmChau,
    },
    routes: [
        {
            path: '/user/danh-muc/chau',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};