//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthNhiemVu from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthNhiemVu }
    },
    routes: [
        {
            path: '/user/hcth/nhiem-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/nhiem-vu/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/nhiem-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/nhiem-vu/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ]
};
