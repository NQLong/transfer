//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThoiKhoaBieu from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThoiKhoaBieu }
    },
    routes: [
        {
            path: '/user/dao-tao/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};