//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmPhong from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmPhong }
    },
    routes: [
        {
            path: '/user/danh-muc/phong/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/:menu/phong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};