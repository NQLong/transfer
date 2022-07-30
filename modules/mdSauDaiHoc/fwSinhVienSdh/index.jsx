//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svSdh from './redux';

export default {
    redux: {
        svSdh
    },
    routes: [
        {
            path: '/user/sv-sdh/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/sau-dai-hoc/sinh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sv-sdh/item/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        }
    ],
};
