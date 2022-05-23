//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNghiViec from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNghiViec }
    },
    routes: [
        {
            path: '/user/danh-muc/ly-do-ngung-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};