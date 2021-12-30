//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiThaiSan from './redux';

export default {
    redux: {
        qtNghiThaiSan,
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-thai-san',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-thai-san/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
    ],
};