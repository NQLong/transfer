//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import svBaoHiemYTe from './redux';

export default {
    redux: {
        parent: 'sinhVien',
        reducers: { svBaoHiemYTe }
    },
    routes: [
        {
            path: '/user/students/bhyt',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};
