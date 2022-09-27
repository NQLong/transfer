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
            path: '/user/sau-dai-hoc/khoa-sau-dai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 