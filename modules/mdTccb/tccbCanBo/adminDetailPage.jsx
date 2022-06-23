import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getStaffEdit, createStaff, updateStaff, downloadWord
} from './redux';
import { getDmQuanHeGiaDinhAll } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import ComponentCaNhan from './componentCaNhan';
import { AdminPage, CirclePageButton } from 'view/component/AdminPage';
import ComponentQuanHe from './componentQuanHe';
import ComponentTTCongTac from './componentTTCongTac';
import ComponentTrinhDo from './componentTrinhDo';
import Loading from 'view/component/Loading';
class CanBoPage extends AdminPage {
    shcc = null
    state = { item: null, create: false, load: true, lastModified: null }
    componentDidMount() {
        T.hideSearchBox();
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/staff/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.shcc = shcc && shcc != 'new' ? shcc : null;
            if (this.shcc) {
                this.setState({
                    shcc: this.shcc
                });
                this.props.getStaffEdit(this.shcc, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    }
                    else {
                        this.setState({ lastModified: data.item.lastModified, staff: data.item });
                        this.setUp(data.item);
                    }
                });
            } else {
                this.setState({
                    create: true,
                    load: false
                });
            }
        });
    }

    downloadWord = (e, type) => {
        e.preventDefault();
        this.shcc && this.props.downloadWord(this.shcc, type, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), this.shcc + '_' + type + '.docx');
        });
    }

    setUp = (item) => {
        this.componentCaNhan?.value(item);
        this.componentTTCongTac?.value(item);
        this.componentTrinhDo?.value(item);
        this.setState({ load: false, phai: item.phai });
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = !this.state.create ? this.componentTrinhDo.getAndValidate() : {};
        if (this.shcc) {
            caNhanData && congTacData && trinhDoData && this.props.updateStaff(this.shcc, { ...caNhanData, ...congTacData, ...trinhDoData });
        } else {
            caNhanData && congTacData && trinhDoData && this.props.createStaff({ ...caNhanData, ...congTacData, ...trinhDoData }, () => this.props.history.push('/user/tccb/staff'));
        }
    }


    render() {
        const permission = this.getUserPermission('staff');
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Hồ sơ cá nhân',
            subTitle: <span>Chỉnh sửa lần cuối lúc <span style={{ color: 'blue' }}>{this.state.lastModified ? T.dateToText(this.state.lastModified) : ''}</span></span>,
            breadcrumb: [
                <Link key={0} to='/user/staff'>Cán bộ</Link>,
                'Lý lịch cán bộ',
            ],
            content: <>
                {this.state.load && <Loading />}
                <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.write} shcc={this.state.shcc} />
                {!this.state.create && <ComponentQuanHe ref={e => this.componentQuanHe = e} shcc={this.state.shcc} phai={this.state.phai} />}
                {!this.state.create && <ComponentTTCongTac ref={e => this.componentTTCongTac = e} shcc={this.state.shcc} readOnly={!permission.write} />}
                {!this.state.create && <ComponentTrinhDo ref={e => this.componentTrinhDo = e} shcc={this.state.shcc} readOnly={!permission.write} />}

                <CirclePageButton type='custom' tooltip='Tải về lý lịch viên chức (2019)' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '125px' }} onClick={e => this.downloadWord(e, 'vc')} />

                <CirclePageButton type='custom' tooltip='Tải về lý lịch công chức (2008)' customIcon='fa-file-word-o' customClassName='btn-primary' style={{ marginRight: '65px' }} onClick={e => this.downloadWord(e, 'cc')} />

                <CirclePageButton type='custom' tooltip='Lưu thay đổi' customIcon='fa-save' customClassName='btn-success' style={{ marginRight: '5px' }} onClick={this.save} />
            </>,
            backRoute: '/user/tccb/staff',
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll, downloadWord
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoPage);