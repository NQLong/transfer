//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import inews from './redux';

export default {
    redux: {
        inews
    },
    routes: [
        {
            path: '/user/inews',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/inews/edit/:inewsId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        }
    ]
};