//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiHinhNghienCuu from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmLoaiHinhNghienCuu } 
    },
    routes: [
        {
            path: '/user/danh-muc/loai-hinh-nghien-cuu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};