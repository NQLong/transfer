//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTrinhDoNgoaiNgu from './redux';

export default {
    redux: {
        dmTrinhDoNgoaiNgu,
    },
    routes: [
        {
            path: '/user/danh-muc/trinh-do-ngoai-ngu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};