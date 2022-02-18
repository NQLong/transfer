//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHoTroHocPhi from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmHoTroHocPhi, }
    },
    routes: [
        {
            path: '/user/danh-muc/ho-tro-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};