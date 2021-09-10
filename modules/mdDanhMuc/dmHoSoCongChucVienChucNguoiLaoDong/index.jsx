//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHoSoCcvcNld from './redux';

export default {
    redux: {
        dmHoSoCcvcNld,
    },
    routes: [
        {
            path: '/user/danh-muc/ho-so-cong-chuc-vien-chuc-nguoi-lao-dong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};