//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMonHocSdh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMonHocSdh }
    },
    routes: [
        {
            path: '/user/danh-muc/mon-hoc-sdh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 