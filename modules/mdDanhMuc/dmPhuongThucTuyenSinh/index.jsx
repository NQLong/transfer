//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmPhuongThucTuyenSinh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmPhuongThucTuyenSinh, }
    },
    routes: [
        {
            path: '/user/danh-muc/phuong-thuc-tuyen-sinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};