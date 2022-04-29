import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getStaffEdit, updateStaff
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
            if (this.props.system && this.props.system.user && this.props.system.user.staff) {
                const staff = this.props.system.user.staff;
                if (!staff.shcc) {
                    T.notify('Cán bộ chưa có mã thẻ', 'danger');
                    this.props.history.goBack();
                } else this.shcc = staff.shcc;
                this.props.getStaffEdit(this.shcc, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                        return;
                    } else if (data.item) {
                        this.setState({ lastModified: data.item.lastModified });
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
        // const congTacData = this.componentTTCongTac.getAndValidate();
        // const trinhDoData = this.componentTrinhDo.getAndValidate();
        this.props.updateStaff(this.shcc, {
            ...caNhanData
        });
        // if (this.emailCanBo) {
        //     if (caNhanData && congTacData && trinhDoData) {
        //         this.props.updateStaff(this.emailCanBo, { ...caNhanData, ...congTacData, ...trinhDoData, userModified: this.emailCanBo, lastModified: new Date().getTime() }, () => this.setState({ lastModified: new Date().getTime() }));
        //     }
        // }
    }


    render() {
        const permission = this.getUserPermission('staff', ['login', 'read', 'write', 'delete']),
            shcc = this.props.system.user.staff.shcc;
        if (permission.login && permission.write) permission.write = false;

        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'HỒ SƠ CÁ NHÂN',
            subTitle: <span>Chỉnh sửa lần cuối lúc <span style={{ color: 'blue' }}>{T.dateToText(this.state.lastModified) || ''}</span></span>,
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Hồ sơ',
            ],
            content: <>
                {!this.state.item && <Loading />}
                <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.write} shcc={shcc} />
                <ComponentQuanHe ref={e => this.componentQuanHe = e} shcc={shcc} />
                <ComponentTTCongTac ref={e => this.componentTTCongTac = e} shcc={shcc} readOnly={!permission.write} />
                <ComponentTrinhDo ref={e => this.componentTrinhDo = e} shcc={shcc} tccb={false} />
            </>,
            backRoute: '/user',
            onSave: this.save,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff
};
export default connect(mapStateToProps, mapActionsToProps)(StaffUserPage);