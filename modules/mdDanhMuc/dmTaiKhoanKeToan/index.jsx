//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTaiKhoanKeToan from './redux';

export default {
    redux: {
        dmTaiKhoanKeToan,
    },
    routes: [
        {
            path: '/user/danh-muc/tai-khoan-ke-toan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/danh-muc/tai-khoan-ke-toan/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        }
    ],
};