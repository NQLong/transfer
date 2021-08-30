//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiTaiSanCoDinh from './redux';

export default {
    redux: {
        dmLoaiTaiSanCoDinh,
    },
    routes: [
        {
            path: '/user/danh-muc/loai-tai-san-co-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 