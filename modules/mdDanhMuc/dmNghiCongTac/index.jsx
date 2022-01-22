//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNghiCongTac from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmNghiCongTac }
    },
    routes: [
        {
            path: '/user/danh-muc/nghi-cong-tac',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};