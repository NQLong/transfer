//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNgachLuong from './redux';

export default {
    redux: {
        dmNgachLuong,
    },
    routes: [
        {
            path: '/user/danh-muc/ngach-luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};