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
            path: '/user/hcth/van-ban-di',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/van-ban-di/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/van-ban-di',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/van-ban-di/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        // {
        //     path: '/user/v2/van-ban-di/:id',
        //     component: Loadable({ loading: Loading, loader: () => import('../hcthVanBanDi/userEditPage') })
        // }
    ]
};
