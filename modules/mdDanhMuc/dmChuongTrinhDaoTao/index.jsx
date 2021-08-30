//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChuongTrinhDaoTao from './redux';

export default {
    redux: {
        dmChuongTrinhDaoTao,
    },
    routes: [
        {
            path: '/user/danh-muc/chuong-trinh-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};