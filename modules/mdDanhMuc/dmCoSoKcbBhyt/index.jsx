//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmCoSoKcb from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmCoSoKcb },
    },
    routes: [
        {
            path: '/user/danh-muc/co-so-kham-chua-benh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};
