//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthCongVanDen from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthCongVanDen }
    },
    routes: [
        {
            path: '/user/hcth/cong-van-den',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        {
            path: '/user/hcth/cong-van-den/:id',
            component: Loadable({ loading: Loading, loader: () => import('./staffEditPage') })
        },
    ]
};
