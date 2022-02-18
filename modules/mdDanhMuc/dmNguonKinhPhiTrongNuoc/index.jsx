//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmNguonKinhPhiTrongNuoc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmNguonKinhPhiTrongNuoc }
    },
    routes: [
        {
            path: '/user/danh-muc/nguon-kinh-phi-trong-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};