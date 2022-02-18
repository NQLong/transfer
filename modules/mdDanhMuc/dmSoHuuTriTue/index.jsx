//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSoHuuTriTue from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmSoHuuTriTue }
    },
    routes: [
        {
            path: '/user/danh-muc/so-huu-tri-tue',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};