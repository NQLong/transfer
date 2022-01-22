//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtKeoDaiCongTac from './redux';

export default {
    redux: {
        qtKeoDaiCongTac,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/keo-dai-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};