//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmQuanHeGiaDinh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmQuanHeGiaDinh }
    },
    routes: [
        {
            path: '/user/danh-muc/quan-he-gia-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};