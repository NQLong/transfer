//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMonHocSdh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { dmMonHocSdh }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/mon-hoc/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/sau-dai-hoc/mon-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-muc/mon-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 