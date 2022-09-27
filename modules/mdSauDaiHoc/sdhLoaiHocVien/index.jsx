//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLoaiHocVien from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLoaiHocVien, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/loai-hoc-vien',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};