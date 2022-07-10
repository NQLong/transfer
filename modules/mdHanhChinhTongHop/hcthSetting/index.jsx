//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import HcthSetting from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { HcthSetting }
    },
    routes: [
        {
            path: '/user/hcth/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};