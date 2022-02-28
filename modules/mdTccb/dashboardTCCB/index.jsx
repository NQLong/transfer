//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dashboardTccb from './redux';
export default {
    redux: {
        parent: 'tccb',
        reducers: { dashboardTccb }
    },
    routes: [
        {
            path: '/user/tccb/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
