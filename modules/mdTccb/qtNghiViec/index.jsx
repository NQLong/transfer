//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiViec from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtNghiViec }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-viec/create-list',
            component: Loadable({ loading: Loading, loader: () => import('./adminCreatePage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-viec',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
