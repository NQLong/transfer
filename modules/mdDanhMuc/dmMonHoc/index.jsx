//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMonHoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMonHoc }
    },
    routes: [
        {
            path: '/user/danh-muc/mon-hoc/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/danh-muc/mon-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};