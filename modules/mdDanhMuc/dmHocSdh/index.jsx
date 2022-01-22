
//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHocSdh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHocSdh, }
    },
    routes: [
        {
            path: '/user/danh-muc/hoc-sdh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};