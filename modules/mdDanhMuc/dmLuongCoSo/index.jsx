//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLuongCoSo from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmLuongCoSo }
    },
    routes: [
        {
            path: '/user/danh-muc/luong-co-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};