//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvMonThi from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvMonThi }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/mon-thi',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};