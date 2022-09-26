//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbCaNhanDangKy from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbCaNhanDangKy }
    },
    routes: [
        {
            path: '/user/danh-gia/ca-nhan-dang-ky',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-gia/ca-nhan-dang-ky/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};