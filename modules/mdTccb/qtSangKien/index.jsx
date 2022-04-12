//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtSangKien from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtSangKien }
    },
    routes: [
        // {
        //     path: '/user/tccb/qua-trinh/sang-kien/group/:shcc',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        // },
        {
            path: '/user/tccb/qua-trinh/sang-kien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/sang-kien',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        {
            path: '/user/tccb/qua-trinh/sang-kien/upload',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
    ],
};
