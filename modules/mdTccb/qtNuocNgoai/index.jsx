//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNuocNgoai from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtNuocNgoai }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nuoc-ngoai/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
