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
    state = { item: null, lastModified: null }

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
                        T.notify('Bạn không tồn tại trong hệ thống cán bộ', 'danger');
                    }
                });
            }
        });
    }

    setUp = (item) => {
        this.componentCaNhan.value(item);
        this.componentTTCongTac.value(item);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
        this.setState({ item });
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        if (this.emailCanBo) {
            if (caNhanData && congTacData && trinhDoData) {
                this.props.updateStaffUser(this.emailCanBo, { ...caNhanData, ...congTacData, ...trinhDoData, userModified: this.emailCanBo, lastModified: new Date().getTime() }, () => this.setState({ lastModified: new Date().getTime() }) );
            }
        }
    }


    render() {
        const { data } = this.props.system && this.props.system.user ? this.props.system.user : { data: null };
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'HỒ SƠ CÁ NHÂN',
            subTitle: data ? <small style={{ color: 'blue' }}>Chỉnh sửa lần cuối lúc {T.dateToText(this.state.lastModified ? this.state.lastModified : data.lastModified, 'hh:mm:ss dd/mm/yyyy')}</small> : '',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Hồ sơ',
            ],
            content: <>
                {!this.state.item && <Loading />}
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