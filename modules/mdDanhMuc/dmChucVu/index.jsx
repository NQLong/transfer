//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChucVu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChucVu, }
    },
    routes: [
        {
            path: '/user/danh-muc/chuc-vu/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/danh-muc/chuc-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};