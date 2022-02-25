//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import staff from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { staff }
    },
    routes: [
        {
            path: '/user/profile',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        {
            path: '/user/tccb/staff/item/upload',
            component: Loadable({ loading: Loading, loader: () => import('./staffImportPage') })
        },
        {
            path: '/user/tccb/staff/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetailPage') })
        },
        {
            path: '/user/tccb/staff',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        // {
        //     path: '/user/index.html',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminProfilePage') })
        // },
        // {
        //     path: '/user',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminProfilePage') })
        // },
    ],
};