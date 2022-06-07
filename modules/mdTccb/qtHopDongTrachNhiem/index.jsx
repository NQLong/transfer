//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHopDongTrachNhiem from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHopDongTrachNhiem }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hop-dong-trach-nhiem/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hop-dong-trach-nhiem',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};