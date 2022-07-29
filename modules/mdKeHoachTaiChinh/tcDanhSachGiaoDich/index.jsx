//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcGiaoDich from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcGiaoDich }
    },
    routes: [
        {
            path: '/user/finance/danh-sach-giao-dich',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};