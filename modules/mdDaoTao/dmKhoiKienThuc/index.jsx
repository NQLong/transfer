//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKhoiKienThuc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmKhoiKienThuc }
    },
    routes: [
        {
            path: '/user/dao-tao/khoi-kien-thuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};