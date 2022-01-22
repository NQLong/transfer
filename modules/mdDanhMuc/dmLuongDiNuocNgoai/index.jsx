//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLuongDiNuocNgoai from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmLuongDiNuocNgoai }
    },
    routes: [
        {
            path: '/user/danh-muc/luong-di-nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};