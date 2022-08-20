//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dashboardHcth from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { dashboardHcth }
    },
    routes: [
        {
            path: '/user/hcth/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ]
};