//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtCongTacTrongNuoc from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtCongTacTrongNuoc }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/cong-tac-trong-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/cong-tac-trong-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
    ],
};
