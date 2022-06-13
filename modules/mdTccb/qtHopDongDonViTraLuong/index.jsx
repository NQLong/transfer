//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHopDongDvtl from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHopDongDvtl }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hop-dong-dvtl/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-dvtl',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};