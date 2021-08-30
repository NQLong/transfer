//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmPhuCap from './reduxPhuCap';
import dmHuongPhuCap from './reduxHuongPhuCap';

export default {
    redux: {
        dmHuongPhuCap, dmPhuCap,
    },
    routes: [
        {
            path: '/user/danh-muc/huong-phu-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminHuongPhuCapPage') })
        },
        {
            path: '/user/danh-muc/phu-cap',
            component: Loadable({ loading: Loading, loader: () => import('./adminPhuCapPage') })
        },
    ],
};