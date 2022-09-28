//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhLoaiQuyetDinh from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhLoaiQuyetDinh, }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/loai-quyet-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};