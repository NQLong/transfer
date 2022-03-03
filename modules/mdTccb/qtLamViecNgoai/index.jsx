//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtLamViecNgoai from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtLamViecNgoai }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/lam-viec-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/lam-viec-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        {
            path: '/user/tccb/qua-trinh/lam-viec-ngoai/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
