//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtDanhSachChuyenNganh from './redux';

export default {
     redux: {
          parent: 'daoTao',
          reducers: { dtDanhSachChuyenNganh }
     },
     routes: [
          {
               path: '/user/dao-tao/danh-sach-chuyen-nganh',
               component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
          },
     ],
};