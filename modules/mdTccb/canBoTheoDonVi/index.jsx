//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import canBoTheoDonVi from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { canBoTheoDonVi }
    },
    routes: [
        {
            path: '/user/nhan-su-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};