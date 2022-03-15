//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDonViGuiCv from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDonViGuiCv }
    },
    routes: [
        {
            path: '/user/danh-muc/don-vi-gui-cong-van',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
}; 