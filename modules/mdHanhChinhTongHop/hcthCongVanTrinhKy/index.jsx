//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthCongVanTrinhKy from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthCongVanTrinhKy },
    },
    routes: [
        {
            path: '/user/cong-van-trinh-ky',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/cong-van-trinh-ky/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userEditPage') })
        },
    ]
};
