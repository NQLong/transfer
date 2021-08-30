//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTrinhDoQuanLyNhaNuoc from './redux';

export default {
    redux: {
        dmTrinhDoQuanLyNhaNuoc,
    },
    routes: [
        {
            path: '/user/danh-muc/trinh-do-quan-ly-nha-nuoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};