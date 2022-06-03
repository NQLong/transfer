//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcHocPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcHocPhi }
    },
    routes: [
        {
            path: '/user/finance/hoc-phi/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/finance/hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};