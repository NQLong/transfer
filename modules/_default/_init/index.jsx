//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionCategory from './sectionCategory';
import system from './reduxSystem';
import category from './reduxCategory';

export default {
    redux: {
        system, category,
    },
    routes: [
        {
            path: '/user/settings',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingsPage') })
        },
        {
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage') })
        },
    ],
    Section: {
        SectionCategory,
    }
};