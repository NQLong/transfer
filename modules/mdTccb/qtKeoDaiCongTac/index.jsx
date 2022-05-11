//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtKeoDaiCongTac from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtKeoDaiCongTac }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/keo-dai-cong-tac/create-list',
            component: Loadable({ loading: Loading, loader: () => import('./adminCreatePage') })
        },
        {
            path: '/user/tccb/qua-trinh/keo-dai-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/keo-dai-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};