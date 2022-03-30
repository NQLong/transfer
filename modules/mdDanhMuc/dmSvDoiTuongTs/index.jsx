//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvDoiTuongTs from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvDoiTuongTs }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/doi-tuong-tuyen-sinh',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};