//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tccbDanhGiaPheDuyetDonVi from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { tccbDanhGiaPheDuyetDonVi }
    },
    routes: [
        {
            path: '/user/tccb/danh-gia-phe-duyet-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/danh-gia-phe-duyet-don-vi/:nam',
            component: Loadable({ loading: Loading, loader: () => import('./adminDetails') })
        }
    ],
};