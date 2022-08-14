//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import ngonNgu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  ngonNgu }
    },
    routes: [
        {
            path: '/user/danh-muc/ngon-ngu-truyen-thong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};