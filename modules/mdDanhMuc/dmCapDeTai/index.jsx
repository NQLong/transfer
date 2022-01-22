//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCapDeTai from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducer: dmCapDeTai
    },
    routes: [
        {
            path: '/user/danh-muc/cap-de-tai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};