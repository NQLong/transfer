//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTinhTrangThietBi from './redux';
export default {
    redux: {
        dmTinhTrangThietBi,
    },
    routes: [
        {
            path: '/user/danh-muc/tinh-trang-thiet-bi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};