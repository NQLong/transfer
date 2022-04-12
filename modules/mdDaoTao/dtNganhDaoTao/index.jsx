//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import dtNganhDaoTao from './redux';

export default {
     redux: {
          parent: 'daoTao',
          reducers: { dtNganhDaoTao }
     },
     routes: [
          {
               path: '/user/dao-tao/nganh-dao-tao',
               component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
          },
     ],
};