//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import qtNghiKhongLuong from './redux';

export default {
    redux: {
        parent: 'tccb',
        reducers: { qtNghiKhongLuong }
    },
    routes: [
        {
            path: '/user/tccb/qua-trinh/nghi-khong-luong',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/nghi-khong-luong',
            component: Loadable({ loading: Loading, loader: () => import('./staffPage') })
        },
        // {
        //     path: '/user/tccb/qua-trinh/nghi-khong-luong/group/:shcc',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminGroupPage') })
        // },
    ],
};
