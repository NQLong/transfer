//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgayLe from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNgayLe }
    },
    routes: [
        // {
        //     path: '/user/danh-muc/dao-tao/mon-hoc/upload',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        // },
        {
            path: '/user/danh-muc/ngay-le',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/ngay-le',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};