//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiThaiSan from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtNghiThaiSan }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-thai-san/group/:shcc',
            component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        },
        {
            path: '/user/tccb/qua-trinh/nghi-thai-san',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/nghi-thai-san',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },

    ],
};