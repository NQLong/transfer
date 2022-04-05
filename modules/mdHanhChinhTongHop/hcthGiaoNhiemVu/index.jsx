//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthGiaoNhiemVu from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthGiaoNhiemVu }
    },
    routes: [
        {
            path: '/user/hcth/giao-nhiem-vu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/hcth/giao-nhiem-vu/:id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ]
};
