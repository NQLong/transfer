//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvBacDaoTao from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvBacDaoTao }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/bac-dao-tao',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};