//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtChucVu from './redux';

export default {
    redux: {
        qtChucVu,
    },
    routes: [
        {
            path: '/user/qua-trinh/chuc-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};