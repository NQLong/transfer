//TEMPLATES: admin

import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMonHoc from './redux';

export default {
    redux: {
        parent: 'daoTao',
        reducers: { dmMonHoc }
    },
    routes: [
        // {
        //     path: '/user/pdt/mon-hoc/upload',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        // },
        {
            path: '/user/pdt/mon-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};