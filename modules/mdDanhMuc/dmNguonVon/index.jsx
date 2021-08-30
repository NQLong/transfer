//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNguonVon from './redux';

export default {
    redux: {
        dmNguonVon,
    },
    routes: [
        {
            path: '/user/danh-muc/nguon-von',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 