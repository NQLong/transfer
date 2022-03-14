//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sinhVien from './redux';

export default {
    redux: {
        sinhVien
    },
    routes: [
        {
            path: '/user/sinh-vien/info',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/students/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/students/item/:mssv',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        }
    ],
};
