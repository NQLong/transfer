import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getStaffEdit, updateStaff, downloadWord, updateStaffUser
} from './redux';
import { createTccbSupport } from '../tccbSupport/redux';
// import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import ComponentCaNhan from './componentCaNhan';
import { AdminPage, CirclePageButton } from 'view/component/AdminPage';
import ComponentQuanHe from './componentQuanHe';
import ComponentTTCongTac from './componentTTCongTac';
import ComponentTrinhDo from './componentTrinhDo';
import Loading from 'view/component/Loading';
import { SupportModal } from './supportModal';
import ComponentHTCT from './componentHTCT';

class StaffUserPage extends AdminPage {
    state = { item: null, lastModified: null }

    componentDidMount() {
        T.ready('/user', () => {
            T.hideSearchBox();
            if (this.props.system && this.props.system.user && this.props.system.user.staff) {
                const staff = this.props.system.user.staff;
                if (!staff.shcc) {
                    T.notify('Cán bộ chưa có mã thẻ', 'danger');
                    this.props.history.goBack();
                } else {
                    this.shcc = staff.shcc;
                    this.email = this.props.system.user.email;
                    this.email && !this.props.system.user.originalEmail && this.props.updateStaffUser(this.email, { lastLogin: Date.now() });
                }
                this.props.getStaffEdit(this.shcc, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                        return;
                    } else if (data.item) {
                        this.setState({ lastModified: data.item.lastModified, staff: data.item });
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
        this.componentCaNhan?.value(item);
        this.componentTTCongTac?.value(item);
        this.componentTrinhDo?.value(item);
        this.setState({ item, phai: item.phai });
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        // this.props.updateStaff(this.shcc, {
        //     ...caNhanData
        // });
        if (this.shcc) {
            if (caNhanData && congTacData && trinhDoData) {
                this.props.updateStaff(this.shcc, { ...caNhanData, ...congTacData, ...trinhDoData, userModified: this.email, lastModified: new Date().getTime() }, () => this.setState({ lastModified: new Date().getTime() }));
            }
        }
    }

    downloadWord = (e, type) => {
        e.preventDefault();
        this.shcc && this.props.downloadWord(this.shcc, type, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.shcc + '_' + type + '.docx');
        });
    }

    render() {
        const permission = this.getUserPermission('staff', ['login', 'read', 'write', 'delete']),
            shcc = this.props.system?.user?.staff.shcc;
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
                <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.login} shcc={shcc} readOnlyByTccb={!permission.write} />
                <ComponentQuanHe ref={e => this.componentQuanHe = e} shcc={shcc} phai={this.state.phai} permission={permission} />
                <ComponentTTCongTac ref={e => this.componentTTCongTac = e} shcc={shcc} permission={permission} />
                <ComponentHTCT />
                <ComponentTrinhDo ref={e => this.componentTrinhDo = e} shcc={shcc} permission={permission} />

                <SupportModal ref={e => this.supportModal = e} create={this.props.createTccbSupport} system={this.props.system} />
                {!permission.write && <CirclePageButton type='custom' tooltip='Yêu cầu thay đổi thông tin' customIcon='fa-universal-access' customClassName='btn-danger' style={{ marginRight: '185px' }} onClick={e => e.preventDefault() || this.supportModal.show({ item: this.state.staff })} />}

                <CirclePageButton type='custom' tooltip='Tải về lý lịch viên chức (2019)' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '125px' }} onClick={e => this.downloadWord(e, 'vc')} />

                <CirclePageButton type='custom' tooltip='Tải về lý lịch công chức (2008)' customIcon='fa-file-word-o' customClassName='btn-primary' style={{ marginRight: '65px' }} onClick={e => this.downloadWord(e, 'cc')} />

                <CirclePageButton type='custom' tooltip='Lưu thay đổi' customIcon='fa-save' customClassName='btn-success' style={{ marginRight: '5px' }} onClick={this.save} />
            </>,
            backRoute: '/user',
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff, downloadWord, createTccbSupport, updateStaffUser
};
export default connect(mapStateToProps, mapActionsToProps)(StaffUserPage);