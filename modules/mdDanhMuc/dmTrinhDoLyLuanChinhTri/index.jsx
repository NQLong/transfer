//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmTrinhDoLyLuanChinhTri from './redux';

export default {
    redux: {
        dmTrinhDoLyLuanChinhTri,
    },
    routes: [
        {
            path: '/user/danh-muc/trinh-do-ly-luan-chinh-tri',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};