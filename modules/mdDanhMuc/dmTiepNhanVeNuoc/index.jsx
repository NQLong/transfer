//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTiepNhanVeNuoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmTiepNhanVeNuoc } 
    },
    routes: [
        {
            path: '/user/danh-muc/tiep-nhan-ve-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};