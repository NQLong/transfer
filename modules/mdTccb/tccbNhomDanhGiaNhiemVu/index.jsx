//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbNhomDanhGiaNhiemVu from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbNhomDanhGiaNhiemVu }
    },
    routes: [
        {
            path: '/user/tccb/nhom-danh-gia-nhiem-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};