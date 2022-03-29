//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionNews from './sectionNews';
import SectionNewsList from './sectionNewsList';
import SectionAdmission from './sectionAdmission';
import SectionNotification from './sectionNotification';
import SectionHighLightNews from './sectionHighLightNews';
import SectionInsight from './sectionInsight';
import news from './redux';

export default {
    redux: {
        news,
    },
    routes: [
        { path: '/user/news/category', component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }) },
        { path: '/user/news/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage') }) },
        { path: '/user/news/edit/:newsId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }) },
        { path: '/user/news/draft/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./adminDraftEditPage') }) },
        { path: '/user/news/draft', component: Loadable({ loading: Loading, loader: () => import('./adminWaitApprovalPage') }) },
        { path: '/user/news/unit/list', component: Loadable({ loading: Loading, loader: () => import('./unitPage') }) },
        { path: '/user/news/unit/edit/:newsId', component: Loadable({ loading: Loading, loader: () => import('./unitEditPage') }) },
        { path: '/user/news/unit/draft/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./unitDraftEditPage') }) },
        { path: '/user/news/unit/draft', component: Loadable({ loading: Loading, loader: () => import('./unitWaitApprovalPage') }) },
        { path: '/user/news/draft/translate/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./translateEditPage') }) },
        { path: '/user/news/draft/translate', component: Loadable({ loading: Loading, loader: () => import('./translatePage') }) },
        { path: '/news/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') }) },
        { path: '/news-en/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') }) },
        // { path: '/:websiteDv/news/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') }) },
        { path: '/tin-tuc/:link', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') }) },
        { path: '/article/:link', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') }) },
        { path: '/megastory/:link', component: Loadable({ loading: Loading, loader: () => import('./homeStory') }) },

        // { path: '/news/list/:category', component: Loadable({ loading: Loading, loader: () => import('./homeNewsList') }) }
    ],
    Section: {
        SectionNews, SectionNewsList, SectionAdmission, SectionNotification, SectionHighLightNews, SectionInsight
    }
};