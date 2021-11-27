//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHopDongDvtlTn from './redux';

export default {
    redux: {
        qtHopDongDvtlTn,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hop-dong-dvtl-tn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-dvtl-tn/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};