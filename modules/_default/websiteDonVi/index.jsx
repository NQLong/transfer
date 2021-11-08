//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dvWebsite from './redux';
import dvWebsiteGioiThieu from './reduxWebsiteGioiThieu';
import dvWebsiteHinh from './reduxWebsiteHinh';
import AllDivisionSection from './allDivisionSection';

export default {
    redux: {
        dvWebsite, dvWebsiteGioiThieu, dvWebsiteHinh,
    },
    routes: [
        {
            path: '/user/website',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/website/edit/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        // {
        //     path: '/user/website/edit/:shortname/:ma',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGioiThieuSectionEdit') })
        // },
        {
            path: '/user/news-donvi/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminNewsPage') })
        },
        {
            path: '/user/event-donvi/:ma',
            component: Loadable({ loading: Loading, loader: () => import('./adminEventPage') })
        },
    ],
    Section: {
        AllDivisionSection
    }
};