//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {},
    routes: [
        {
            path: '/user/van-phong-dien-tu',
            component: Loadable({ loading: Loading, loader: () => import('./mainPage') })
        },
    ],
};