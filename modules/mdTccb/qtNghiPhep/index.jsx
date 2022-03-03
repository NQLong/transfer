//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiPhep from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtNghiPhep }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-phep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/nghi-phep',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-phep/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};
