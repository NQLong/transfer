//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDanToc from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDanToc, }
    },
    routes: [
        {
            path: '/user/danh-muc/dan-toc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};