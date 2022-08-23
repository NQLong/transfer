//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaNam from './redux';
import tccbKhungDanhGiaCanBo from './reduxKhungDanhGiaCanBo';
import tccbKhungDanhGiaDonVi from './reduxKhungDanhGiaDonVi';

export default {
    redux: {
        parent: 'danhGia',
        reducers: { tccbDanhGiaNam, tccbKhungDanhGiaCanBo, tccbKhungDanhGiaDonVi }
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