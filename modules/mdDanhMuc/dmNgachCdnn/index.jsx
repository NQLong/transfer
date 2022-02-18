//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgachCdnn from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmNgachCdnn }
    },
    routes: [
        {
            path: '/user/danh-muc/ngach-cdnn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};