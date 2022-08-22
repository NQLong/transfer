//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbKhungDanhGiaDonVi from './redux';

export default {
    redux: {
        parent: 'danhGia',
        reducers: { tccbKhungDanhGiaDonVi }
    },
    routes: [
        {
            path: '/user/danh-gia/cau-truc-khung-danh-gia-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-gia/cau-truc-khung-danh-gia-don-vi/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};