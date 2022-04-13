//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLoaiCongVan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmLoaiCongVan }
    },
    routes: [
        {
            path: '/user/danh-muc/loai-cong-van',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 
