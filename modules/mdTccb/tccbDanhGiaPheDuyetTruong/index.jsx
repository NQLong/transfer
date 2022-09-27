//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaPheDuyetTruong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaPheDuyetTruong }
    },
    routes: [
        {
            path: '/user/tccb/danh-gia-phe-duyet-truong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/danh-gia-phe-duyet-truong/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};