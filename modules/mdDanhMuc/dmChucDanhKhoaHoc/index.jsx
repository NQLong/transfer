//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChucDanhKhoaHoc from './redux';

export default {
    redux: {
        dmChucDanhKhoaHoc,
    },
    routes: [
        {
            path: '/user/danh-muc/chuc-danh-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};