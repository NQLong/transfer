//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChucDanhChuyenMon from './redux';

export default {
    redux: {
        dmChucDanhChuyenMon,
    },
    routes: [
        {
            path: '/user/danh-muc/chuc-danh-chuyen-mon',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};