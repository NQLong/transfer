//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmKinhPhiNuocNgoai from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: {  dmKinhPhiNuocNgoai } 
    },
    routes: [
        {
            path: '/user/danh-muc/kinh-phi-nuoc-ngoai',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};