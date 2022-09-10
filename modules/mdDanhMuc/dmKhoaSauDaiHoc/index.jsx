//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhoaSdh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmKhoaSdh }
    },
    routes: [
        {
            path: '/user/danh-muc/khoa-sau-dai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 