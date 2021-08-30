//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmLinhVucKinhDoanh from './redux';

export default {
    redux: {
        dmLinhVucKinhDoanh,
    },
    routes: [
        {
            path: '/user/danh-muc/linh-vuc-kinh-doanh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};