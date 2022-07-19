//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvKhuVucTuyenSinh from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvKhuVucTuyenSinh }
  },
  routes: [
    {
      path: '/user/danh-muc/khu-vuc-tuyen-sinh',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
    {
      path: '/user/dao-tao/khu-vuc-tuyen-sinh',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};