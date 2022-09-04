//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import hcthInstruction from './redux';

export default {
    redux: {
        parent: 'hcth',
        reducers: { hcthInstruction },
    },
    routes: [
        {
            path: '/user/instruction',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') }),
        },
        {
            path: '/user/instruction/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userEditPage') })
        }
    ]
};