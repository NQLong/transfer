
//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmQuocGia from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmQuocGia }
    },
    routes: [
        {
            path: '/user/danh-muc/quoc-gia/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/danh-muc/quoc-gia',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};