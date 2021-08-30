//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDienChinhSach from './redux';

export default {
    redux: {
        dmDienChinhSach
    },
    routes: [
        {
            path: '/user/danh-muc/dien-chinh-sach',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};