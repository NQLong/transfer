//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcInvoice from './redux';


export default {
    redux: {
        parent: 'finance',
        reducers: { tcInvoice }
    },
    routes: [
        {
            path: '/user/finance/invoice',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};