//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHocTapCongTac from './redux';

export default {
    redux: {
        qtHocTapCongTac,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hoc-tap-cong-tac/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hoc-tap-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
