//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import menu from './redux';
import submenu from './reduxSubMenu';
import header from './reduxHeader';

export default {
    redux: {
        menu, submenu, header
    },
    routes: [
        {
            path: '/user/menu/edit/:menuId/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/menu/edit/:menuId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/menu/:divisionId',
            component: Loadable({ loading: Loading, loader: () => import('./adminDivisionPage') }),
        },
        {
            path: '/user/menu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};