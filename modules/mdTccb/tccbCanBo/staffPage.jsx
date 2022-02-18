import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    userGetStaff, updateStaffUser
} from './redux';
// import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import ComponentCaNhan from './componentCaNhan';
import { AdminPage } from 'view/component/AdminPage';
import ComponentQuanHe from './componentQuanHe';
import ComponentTTCongTac from './componentTTCongTac';
import ComponentTrinhDo from './componentTrinhDo';
import Loading from 'view/component/Loading';
// import ComponentKhenThuong from '../qtKhenThuongAll/componentKhenThuong';
// import ComponentNCKH from '../qtNghienCuuKhoaHoc/componentNCKH';
// import ComponentKyLuat from '../qtKyLuat/componentKyLuat';
// import ComponentNuocNgoai from '../qtNuocNgoai/componentNuocNgoai';
// import ComponentHDLV from '../qtHuongDanLuanVan/componentHDLV';
// import ComponentSGT from '../sachGiaoTrinh/componentSGT';
// import ComponentDaoTao from '../qtDaoTao/componentDaoTao';
// import ComponentLuong from '../qtLuong/componentLuong';
// import ComponentCongTac from '../qtHocTapCongTac/componentCongTac';
// import ComponentBaoHiemXaHoi from '../qtBaoHiemXaHoi/componentBaoHiemXaHoi';

class StaffUserPage extends AdminPage {
    state = { item: null }

    componentDidMount() {
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const user = this.props.system.user;
                this.emailCanBo = user.email ? user.email : null;
                this.props.userGetStaff(user.email, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    } else if (data.item) {
                        this.setUp(data.item);
                    }
                    else {
                        this.setState({ isLoad: false });
                        // this.profileCommon.value(user);
                    }
                });
            }
        });
    }

    setUp = (item) => {
        this.componentCaNhan.value(item);
        this.componentTTCongTac.value(item);
        // this.componentCongTac.value(item.shcc, item.email);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
        // this.componentDaoTao.value(item.shcc, item.email);
        // this.componentKhenThuong.value(item.shcc);
        // this.componentNCKH.value(item.shcc, item.email);
        // this.componentKyLuat.value(item.shcc);
        // this.componentNuocNgoai.value(item.shcc, item.email);
        // this.componentHDLV.value(item.shcc, item.email);
        // this.componentSGT.value(item.shcc, item.email);
        // this.componentLuong.value(item.shcc, item.email);
        // this.componentBaoHiemXaHoi.value(item.shcc, item.email);
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        if (this.emailCanBo) {
            caNhanData && congTacData && trinhDoData && this.props.updateStaffUser(this.emailCanBo, { ...caNhanData, ...congTacData, ...trinhDoData });
        }
    }


    render() {
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'HỒ SƠ CÁ NHÂN',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Hồ sơ',
            ],
            content: <>
                {name == '' && <Loading />}
                <ComponentCaNhan ref={e => this.componentCaNhan = e} userEdit={true} isStaff={true} />
                <ComponentQuanHe ref={e => this.componentQuanHe = e} userEdit={true} />
                <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={true} />
                <ComponentTrinhDo ref={e => this.componentTrinhDo = e} userEdit={true} tccb={false} />
            </>,
            backRoute: '/user',
            onSave: this.save,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    userGetStaff, updateStaffUser
};
export default connect(mapStateToProps, mapActionsToProps)(StaffUserPage);