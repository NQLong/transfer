//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChungChiTiengAnh from './redux';

export default {
    redux: {
        dmChungChiTiengAnh,
    },
    routes: [
        {
            path: '/user/danh-muc/chung-chi-tieng-anh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};