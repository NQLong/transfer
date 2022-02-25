//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtHuongDanLuanVan from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtHuongDanLuanVan }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/hdlv/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/hdlv',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/huong-dan-luan-van',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        }
    ],
};