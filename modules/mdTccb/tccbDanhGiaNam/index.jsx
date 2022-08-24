//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaNam from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaNam }
    },
    routes: [
        {
            path: '/user/tccb/danh-gia',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/danh-gia/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};