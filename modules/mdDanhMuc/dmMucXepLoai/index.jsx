//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmMucXepLoai from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmMucXepLoai }
    },
    routes: [
        {
            path: '/user/danh-muc/muc-xep-loai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};