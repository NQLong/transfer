//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtDiNuocNgoai from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtDiNuocNgoai }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/di-nuoc-ngoai/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/di-nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/di-nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};
