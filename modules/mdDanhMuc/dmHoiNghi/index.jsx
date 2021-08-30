//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHoiNghi from './redux';

export default {
    redux: {
        dmHoiNghi,
    },
    routes: [
        {
            path: '/user/danh-muc/hoi-nghi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};