//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import danhSachDonVi from 'modules/mdDanhMuc/dmDonVi/redux';
export default {
    redux: {
        parent: 'tccb',
        reducers: { danhSachDonVi }
    },
    routes: [
        {
            path: '/user/tccb/danh-sach-don-vi',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};
