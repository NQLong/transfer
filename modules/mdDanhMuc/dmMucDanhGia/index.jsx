//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMucDanhGia from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMucDanhGia }
    },
    routes: [
        {
            path: '/user/danh-muc/muc-danh-gia',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};