//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtBaoHiemXaHoi from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtBaoHiemXaHoi }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/bao-hiem-xa-hoi/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};