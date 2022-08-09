//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthYeuCauTaoKhoa from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthYeuCauTaoKhoa }
    },
    routes: [
        {
            path: '/user/hcth/yeu-cau-tao-khoa',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/yeu-cau-tao-khoa',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ]
};
