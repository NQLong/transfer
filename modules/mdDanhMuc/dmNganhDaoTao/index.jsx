//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNganhDaoTao from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmNganhDaoTao }
    },
    routes: [
        {
            path: '/user/danh-muc/nganh-dao-Tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};