//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dmSvLoaiHinhDaoTao from './redux';

export default {
  redux: {
    parent: 'danhMuc',
    reducers: { dmSvLoaiHinhDaoTao }
  },
  routes: [
    {
      path: '/user/danh-muc/dao-tao/loai-hinh-dao-tao',
      component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
    },
  ],
};