//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmBenhVien from './reduxBenhVien';
import dmTuyenBenhVien from './reduxTuyenBenhVien';
import dmNhomMau from './reduxNhomMau';

export default {
    redux: {
        dmBenhVien,
        dmTuyenBenhVien,
        dmNhomMau,
    },
    routes: [
        {
            path: '/user/danh-muc/benh-vien/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminUploadPage') })
        },
        {
            path: '/user/danh-muc/benh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminBenhVienPage') })
        },
        {
            path: '/user/danh-muc/tuyen-benh-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminTuyenBenhVienPage') })
        },
        {
            path: '/user/danh-muc/nhom-mau',
            component: Loadable({ loading: Loading, loader: () => import('./adminNhomMauPage') })
        },
    ],
};