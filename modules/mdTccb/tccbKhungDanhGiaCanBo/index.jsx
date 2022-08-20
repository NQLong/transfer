//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbKhungDanhGiaCanBo from './redux';

export default {
    redux: {
        parent: 'danhGia',
        reducers: { tccbKhungDanhGiaCanBo }
    },
    routes: [
        {
            path: '/user/danh-gia/cau-truc-khung-danh-gia-can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-gia/cau-truc-khung-danh-gia-can-bo/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};