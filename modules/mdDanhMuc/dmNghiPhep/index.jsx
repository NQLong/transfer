//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNghiPhep from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmNghiPhep, }
    },
    routes: [
        {
            path: '/user/danh-muc/nghi-phep',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};