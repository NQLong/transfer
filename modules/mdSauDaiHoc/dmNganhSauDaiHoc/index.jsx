//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNganhSdh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNganhSdh }
    },
    routes: [
        {
            path: '/user/danh-muc/nganh-sau-dai-hoc/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/danh-muc/nganh-sau-dai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 