//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTapChi from './redux';

export default {
    redux: {
        dmTapChi,
    },
    routes: [
        {
            path: '/user/danh-muc/tap-chi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};