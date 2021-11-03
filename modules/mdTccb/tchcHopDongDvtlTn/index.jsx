//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import staff from './redux';

export default {
    redux: {
        staff,
    },
    routes: [
        {
            path: '/user/hopDongDvtlTn',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};