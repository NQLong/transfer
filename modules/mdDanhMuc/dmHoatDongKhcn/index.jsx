import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHoatDongKhcn from './redux';

export default {
    redux: {
        dmHoatDongKhcn
    },
    routes: [
        {
            path: '/user/khcn/dm-hoat-dong-khcn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};