//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghienCuuKhoaHoc from './redux';

export default {
    redux: {
        parent: 'khcn',
        reducers: { qtNghienCuuKhoaHoc }
    },
    routes: [
        {
            path: '/user/nghien-cuu-khoa-hoc/:id/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./staffEditPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghien-cuu-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/khcn/qua-trinh/nghien-cuu-khoa-hoc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/khcn/qua-trinh/nghien-cuu-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/nghien-cuu-khoa-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },

    ],
};
