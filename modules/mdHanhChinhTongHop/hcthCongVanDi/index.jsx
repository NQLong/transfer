//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthCongVanDi from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthCongVanDi }
    },
    routes: [
        {
        path: '/user/hcth/cong-van-cac-phong',
        component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
        path: '/user/hcth/cong-van-cac-phong/:id',
        component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        }
    ]
};
