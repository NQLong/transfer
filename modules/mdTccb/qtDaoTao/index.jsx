//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtDaoTao from './redux';

export default {
    redux: {
        parents: 'tccb',
        reducers: { qtDaoTao }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/dao-tao/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};