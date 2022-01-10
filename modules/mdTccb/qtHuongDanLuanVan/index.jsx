//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHuongDanLuanVan from './redux';

export default {
    redux: {
        qtHuongDanLuanVan,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hdlv',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        // {
        //     path: '/user/tccb/qua-trinh/dao-tao/group/:shcc',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        // },
    ],
};