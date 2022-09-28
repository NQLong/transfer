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
            path: '/user/sau-dai-hoc/phan-he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};