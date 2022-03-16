//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHoTroHocPhi from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHoTroHocPhi }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/ho-tro-hoc-phi/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/ho-tro-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/ho-tro-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        }
    ]
};
