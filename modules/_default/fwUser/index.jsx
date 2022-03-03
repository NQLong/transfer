//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import user from './reduxUser';

export default {
    redux: {
        user,
    },
    routes: [
        {
            path: '/user/member',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user',
            component: Loadable({ loading: Loading, loader: () => import('./profilePage') })
        },
    ],
};