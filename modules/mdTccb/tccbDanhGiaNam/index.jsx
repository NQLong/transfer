//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaNam from './redux';
import tccbThongTinDonVi from './reduxThongTinDonVi';
import tccbThongTinCaNhan from './reduxThongTinCaNhan';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaNam, tccbThongTinDonVi, tccbThongTinCaNhan }
    },
    routes: [
        {
            path: '/user/tccb/danh-gia',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/danh-gia/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        },
        {
            path: '/user/tccb/danh-gia/:nam/don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminListDonVi') })
        },
        {
            path: '/user/tccb/danh-gia/:nam/don-vi/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonViDangKyDetail') })
        },
        {
            path: '/user/tccb/danh-gia-ca-nhan/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminCaNhanDangKyDetails') })
        }
    ],
};