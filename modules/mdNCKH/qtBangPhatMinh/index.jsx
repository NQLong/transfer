//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtBangPhatMinh from './redux';

export default {
    redux: {
        parent: 'khcn',
        reducers: { qtBangPhatMinh }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/bang-phat-minh/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/bang-phat-minh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/bang-phat-minh',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },

    ],
};
