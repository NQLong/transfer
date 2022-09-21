//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDienDongBhyt from './redux';

export default {
    redux: {
        parent: 'sinhVien',
        reducers: { dmDienDongBhyt}
    },
    routes: [
        {
            path: '/user/students/dien-dong-bhyt',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};