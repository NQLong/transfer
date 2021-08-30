//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDonViTinh from './redux';

export default {
    redux: {
        dmDonViTinh,
    },
    routes: [
        {
            path: '/user/danh-muc/don-vi-tinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};