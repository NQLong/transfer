//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtDaoTao from './redux';

export default {
    redux: {
        qtDaoTao,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/tccb/qua-trinh/dao-tao/group/:shcc',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        // },
    ],
};