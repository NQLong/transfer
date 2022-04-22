//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmToaNha from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmToaNha }
    },
    routes: [
        {
            path: '/user/:menu/toa-nha',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};