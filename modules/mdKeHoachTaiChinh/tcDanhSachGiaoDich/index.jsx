//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcTongGiaoDich from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcTongGiaoDich }
    },
    routes: [
        {
            path: '/user/finance/tong-giao-dich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};