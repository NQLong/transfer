//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNganhSdh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { dmNganhSdh }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/danh-sach-nganh/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/sau-dai-hoc/danh-sach-nganh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 