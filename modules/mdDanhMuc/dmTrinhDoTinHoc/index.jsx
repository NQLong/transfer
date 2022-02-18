//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTrinhDoTinHoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTrinhDoTinHoc }
    },
    routes: [
        {
            path: '/user/danh-muc/trinh-do-tin-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};