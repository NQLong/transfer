//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNhomTaiSanCoDinh from './redux';

export default {
    redux: {
        dmNhomTaiSanCoDinh,
    },
    routes: [
        {
            path: '/user/danh-muc/nhom-tai-san-co-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 