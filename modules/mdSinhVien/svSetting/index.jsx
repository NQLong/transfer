//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/students/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
