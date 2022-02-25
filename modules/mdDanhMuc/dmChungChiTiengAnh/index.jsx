//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmChungChiTiengAnh from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmChungChiTiengAnh, }
    },
    routes: [
        {
            path: '/user/danh-muc/chung-chi-tieng-anh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};