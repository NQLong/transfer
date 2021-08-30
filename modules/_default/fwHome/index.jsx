//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

import carousel from './redux/reduxCarousel';
import video from './redux/reduxVideo';
import feature from './redux/reduxFeature';
import content from './redux/reduxContent';

import SectionCarousel from './sectionCarousel';
import SectionFeature from './sectionFeature';
import SectionVideo from './sectionVideo';
import SectionGallery from './sectionGallery';
import SectionContent from './sectionContent';

export default {
    redux: {
        carousel, video, feature, content
    },
    routes: [
        {
            path: '/user/content/edit/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage') })
        },
        {
            path: '/user/carousel/edit/:carouselId',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage') })
        },
        {
            path: '/user/feature/edit/:featureId',
            component: Loadable({ loading: Loading, loader: () => import('./adminFeatureEditPage') })
        },
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage') })
        },
    ],
    Section: {
        SectionCarousel, SectionFeature, SectionVideo, SectionGallery, SectionContent,
    }
};