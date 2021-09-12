//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import fwStorage from './redux';

export default {
    redux: {
        fwStorage,
    },
    routes: [
        {
            path: '/user/storage',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/storage/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
    ],
}; 