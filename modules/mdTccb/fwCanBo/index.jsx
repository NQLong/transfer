//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import staff from './redux';

export default {
    redux: {
        staff,
    },
    routes: [
        {
            path: '/user/staff/item/upload',
            component: Loadable({ loading: Loading, loader: () => import('./staffImportPage') })
        },
        {
            path: '/user/staff/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/staff',
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