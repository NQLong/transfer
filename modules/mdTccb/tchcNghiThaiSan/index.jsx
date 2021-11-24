//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tchcNghiThaiSan from './redux';

export default {
    redux: {
        tchcNghiThaiSan,
    },
    routes: [
        {
            path: '/user/qua-trinh/nghi-thai-san',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};