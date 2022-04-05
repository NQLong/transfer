//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmHangThuongBinh from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmHangThuongBinh, }
  },
  routes: [
    {
      path: '/user/danh-muc/hang-thuong-binh',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};