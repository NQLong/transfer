//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCaHoc from './redux';

export default {
    redux: {
        dmCaHoc,
    },
    routes: [
        {
            path: '/user/danh-muc/ca-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};