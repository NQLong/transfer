//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmPhanLoaiVienChuc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmPhanLoaiVienChuc }
    },
    routes: [
        {
            path: '/user/danh-muc/phan-loai-vien-chuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};