//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangCongTac from './redux';

export default {
    redux: {
        dmTinhTrangCongTac
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};