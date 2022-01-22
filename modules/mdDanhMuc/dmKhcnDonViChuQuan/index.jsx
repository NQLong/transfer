//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmDonViChuQuan from './redux';

export default {
    redux: {
        parent: 'danhMuc',
        reducers: { dmDonViChuQuan, }
    },
    routes: [
        {
            path: '/user/danh-muc/khcn-don-vi-chu-quan',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};