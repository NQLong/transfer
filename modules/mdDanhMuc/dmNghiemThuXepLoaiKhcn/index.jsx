//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNghiemThuXepLoaiKhcn from './redux';

export default {
    redux: {
        dmNghiemThuXepLoaiKhcn,
    },
    routes: [
        {
            path: '/user/danh-muc/nghiem-thu-xep-loai-khcn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};