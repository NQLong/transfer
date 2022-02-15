//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtChucVu from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtChucVu }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/chuc-vu/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/chuc-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};