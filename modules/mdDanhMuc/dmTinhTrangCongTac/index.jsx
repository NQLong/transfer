//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangCongTac from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmTinhTrangCongTac }
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};