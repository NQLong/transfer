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
            path: '/user/tccb/qua-trinh/nghi-viec/group/:loaiDoiTuong/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-viec',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
