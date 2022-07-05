//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import tcLoaiPhi from './redux';

export default {
    redux: {
        parent: 'finance',
        reducers: { tcLoaiPhi }
    },
    routes: [
        {
            path: '/user/finance/loai-phi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};