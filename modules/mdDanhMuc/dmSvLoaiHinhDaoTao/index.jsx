//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvLoaiHinhDaoTao from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmSvLoaiHinhDaoTao }
    },
    routes: [
        {
            path: '/user/danh-muc/he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/he-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};