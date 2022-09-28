//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthDangKySo from './redux';


export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthDangKySo }
    },
    routes: [
        {
            path: '/user/dang-ky-so',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ]
};
