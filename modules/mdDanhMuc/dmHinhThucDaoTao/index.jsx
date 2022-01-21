//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHinhThucDaoTao from './redux';

export default {
    redux: {
        dmHinhThucDaoTao,
    },
    routes: [
        {
            path: '/user/danh-muc/hinh-thuc-dao-tao',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};