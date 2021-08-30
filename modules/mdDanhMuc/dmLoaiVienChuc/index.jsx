//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiVienChuc from './redux';

export default {
    redux: {
        dmLoaiVienChuc,
    },
    routes: [
        {
            path: '/user/danh-muc/loai-vien-chuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};