//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHopDongVienChuc from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHopDongVienChuc }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hop-dong-vien-chuc/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-vien-chuc/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-vien-chuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};