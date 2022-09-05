//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtThoiKhoaBieu from './redux';
import dtTkbConfig from '../dtSettings/redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dtThoiKhoaBieu, dtTkbConfig }
    },
    routes: [
        {
            path: '/user/dao-tao/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/thoi-khoa-bieu/auto-generate',
            component: Loadable({ loading: Loading, loader: () => import('./GenSchedPage') })
        },
    ],
};