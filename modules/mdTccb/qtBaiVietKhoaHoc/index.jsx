//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtBaiVietKhoaHoc from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtBaiVietKhoaHoc }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/bai-viet-khoa-hoc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/bai-viet-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
