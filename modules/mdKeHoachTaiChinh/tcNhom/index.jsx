//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcNhom from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcNhom }
    },
    routes: [
        {
            path: '/user/finance/nhom',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};