//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    routes: [
        { path: '/user/news/admission', component: Loadable({ loading: Loading, loader: () => import('./adminNewsPage') }) },
        { path: '/user/news/draft-admission', component: Loadable({ loading: Loading, loader: () => import('./adminNewsDraftPage') }) },
        { path: '/user/event/admission', component: Loadable({ loading: Loading, loader: () => import('./adminEventPage') }) },
        { path: '/user/event/draft-admission', component: Loadable({ loading: Loading, loader: () => import('./adminEventDraftPage') }) },
    ],
    redux: []
};