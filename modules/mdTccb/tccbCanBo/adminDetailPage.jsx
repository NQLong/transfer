import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getStaffEdit, createStaff, updateStaff,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
} from './redux';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import ComponentCaNhan from './componentCaNhan';
import { AdminPage } from 'view/component/AdminPage';
import ComponentQuanHe from './componentQuanHe';
import ComponentTTCongTac from './componentTTCongTac';
import ComponentTrinhDo from './componentTrinhDo';
import ComponentKhenThuong from '../qtKhenThuongAll/componentKhenThuong';
import ComponentNCKH from '../qtNghienCuuKhoaHoc/componentNCKH';
import ComponentKyLuat from '../qtKyLuat/componentKyLuat';
import ComponentNuocNgoai from '../qtNuocNgoai/componentNuocNgoai';
import ComponentHDLV from '../qtHuongDanLuanVan/componentHDLV';
import ComponentSGT from '../sachGiaoTrinh/componentSGT';

class CanBoPage extends AdminPage {
    state = { item: null }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/staff/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.urlSHCC = shcc && shcc != 'new' ? shcc : null;
            if (this.urlSHCC) {
                this.setState({ create: false });
                this.props.getStaffEdit(shcc, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    }
                    else {
                        this.setUp(data.item);
                    }
                });
            } else {
                this.setState({ create: true });
            }
        });
    }

    setUp = (item) => {
        this.componentCaNhan.value(item);
        this.componentTTCongTac.value(item);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
        this.componentKhenThuong.value(item.shcc);
        this.componentNCKH.value(item.shcc, item.email);
        this.componentKyLuat.value(item.shcc);
        this.componentNuocNgoai.value(item.shcc, item.email);
        this.componentHDLV.value(item.shcc, item.email);
        this.componentSGT.value(item.shcc, item.email);
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        if (this.urlSHCC) {
            caNhanData && congTacData && trinhDoData && this.props.updateStaff(this.urlSHCC, { ...caNhanData, ...congTacData, ...trinhDoData });
        }
    }


    render() {
        const item = this.props.staff?.selectedItem;
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: `Thông tin cán bộ${item?.shcc ? `: ${item?.ho} ${item?.ten}` : ''}`,
            breadcrumb: [
                <Link key={0} to='/user/staff'>Cán bộ</Link>,
                'Lý lịch cán bộ',
            ],
            content: <>
                <ComponentCaNhan ref={e => this.componentCaNhan = e} userEdit={false} isStaff={false}/>
                <ComponentQuanHe ref={e => this.componentQuanHe = e} userEdit={false} />
                <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={false} />
                <ComponentTrinhDo ref={e => this.componentTrinhDo = e} userEdit={false} />
                <ComponentNuocNgoai ref={e => this.componentNuocNgoai = e} userEdit={false} />
                <ComponentKhenThuong ref={e => this.componentKhenThuong = e} userEdit={false} />
                <ComponentKyLuat ref={e => this.componentKyLuat = e} userEdit={false} />
                <ComponentNCKH ref={e => this.componentNCKH = e} userEdit={false} />
                <ComponentHDLV ref={e => this.componentHDLV = e} userEdit={false} />
                <ComponentSGT ref={e => this.componentSGT = e} userEdit={false} />
            </>,
            backRoute: '/user/tccb/staff',
            onSave: this.save,
        });
    }

}

const mapStateToProps = state => ({ staff: state.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoPage);