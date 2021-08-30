//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDoiTuongCanBo from './redux';

export default {
    redux: {
        dmDoiTuongCanBo,
    },
    routes: [
        {
            path: '/user/danh-muc/doi-tuong-can-bo',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 