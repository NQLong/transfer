import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmGiamBhxh from './reduxGiamBhxh';
import dmTangBhxh from './reduxTangBhxh';

export default {
    redux: {
        dmGiamBhxh, dmTangBhxh,
    },
    routes: [
        {
            path: '/user/danh-muc/giam-bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./adminGiamBhxh') })
        },
        {
            path: '/user/danh-muc/tang-bao-hiem-xa-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./adminTangBhxh') })
        },
    ],
};