//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHocPhan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHocPhan }
    },
    routes: [
        // {
        //     path: '/user/danh-muc/hoc-phan/upload',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        // },
        {
            path: '/user/danh-muc/hoc-phan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};