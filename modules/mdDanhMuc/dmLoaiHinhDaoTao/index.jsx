//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiHinhDaoTao from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiHinhDaoTao, }
    },
    routes: [
        {
            path: '/user/danh-muc/loai-hinh-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};