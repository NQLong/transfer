//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDonViDangKyNhiemVu from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDonViDangKyNhiemVu }
    },
    routes: [
        {
            path: '/user/danh-gia/don-vi-dang-ky-nhiem-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-gia/don-vi-dang-ky-nhiem-vu/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};