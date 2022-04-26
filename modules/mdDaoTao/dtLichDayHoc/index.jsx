//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        {
            path: '/user/dao-tao/lich-day-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};