//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionEvent from './sectionEvent';
import SectionEventList from './sectionEventList';
import event from './redux';

export default {
    redux: {
        event,
    },
    routes: [
        { path: '/user/event/category', component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }) },
        { path: '/user/event/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage') }) },
        { path: '/user/event/edit/:eventId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }) },
        { path: '/user/event/draft/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./adminDraftEditPage') }) },
        { path: '/user/event/draft', component: Loadable({ loading: Loading, loader: () => import('./adminWaitApprovalPage') }) },
        { path: '/user/event/registration/:eventId', component: Loadable({ loading: Loading, loader: () => import('./adminRegistrationPage') }) },

        { path: '/event/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeEventDetail') }) },
        { path: '/su-kien/:link', component: Loadable({ loading: Loading, loader: () => import('./homeEventDetail') }) },
        { path: '/event/registration/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeEventRegistration') }) },
        { path: '/su-kien/dangky/:link', component: Loadable({ loading: Loading, loader: () => import('./homeEventRegistration') }) },
        { path: '/event/list', component: Loadable({ loading: Loading, loader: () => import('./homeEventList') }) }
    ],
    Section: {
        SectionEvent, SectionEventList,
    }
};