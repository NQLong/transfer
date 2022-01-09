//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtBaiVietKhoaHoc from './redux';

export default {
    redux: {
        qtBaiVietKhoaHoc,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/bai-viet-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/bai-viet-khoa-hoc/group_bvkh/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
