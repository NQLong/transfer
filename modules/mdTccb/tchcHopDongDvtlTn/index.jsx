//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tchcHopDongDvtlTn from './redux';

export default {
    redux: {
        tchcHopDongDvtlTn,
    },
    routes: [
        {
            path: '/user/hopDongDvtlTn/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hopDongDvtlTn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};