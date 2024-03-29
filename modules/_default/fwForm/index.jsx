//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import form from './redux';
import reduxQuestion from './reduxQuestion';
import reduxAnswer from './reduxAnswer';

export default {
    redux: {
        form, reduxQuestion, reduxAnswer
    },
    routes: [
        {
            path: '/user/form/list',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminPage') }),
        },
        {
            path: '/user/form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminEditPage') }),
        },
    ],
};
