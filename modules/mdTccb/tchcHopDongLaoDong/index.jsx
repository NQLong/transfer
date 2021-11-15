//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tchcHopDongLaoDong from './redux';

export default {
    redux: {
        tchcHopDongLaoDong,
    },
    routes: [
        {
            path: '/user/hopDongLaoDong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hopDongLaoDong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};