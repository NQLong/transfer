//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sdhDmKhoiKienThuc from './redux';

export default {
    redux: {
        parent: 'sdh',
        reducers: { sdhDmKhoiKienThuc }
    },
    routes: [
        {
            path: '/user/sau-dai-hoc/khoi-kien-thuc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};