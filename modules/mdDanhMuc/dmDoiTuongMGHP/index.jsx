//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDoiTuongMghp from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDoiTuongMghp, }
    },
    routes: [
        {
            path: '/user/danh-muc/doi-tuong-mghp',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};