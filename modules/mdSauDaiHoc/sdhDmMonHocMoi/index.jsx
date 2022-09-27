//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMonHocSdhMoi from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { dmMonHocSdhMoi }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/mon-hoc-moi/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/sau-dai-hoc/mon-hoc-moi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-muc/mon-hoc-moi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 