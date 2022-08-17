//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcDinhMucHocPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcDinhMucHocPhi }
    },
    routes: [
        {
            path: '/user/finance/dinh-muc-hoc-phi',
            component: Loadable({ loading: Loading, loader: () => import('./getInfoPage') })
        },
    ],
};