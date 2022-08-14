//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthHoSo from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthHoSo },
    },
    routes: [
        {
            path: '/user/hcth/ho-so',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
        {
            path: '/user/hcth/ho-so/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userEditPage') })
        }
    ]
};
