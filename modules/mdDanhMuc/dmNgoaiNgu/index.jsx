//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgoaiNgu from './redux';

export default {
    redux: {
        dmNgoaiNgu,
    },
    routes: [
        {
            path: '/user/danh-muc/ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};