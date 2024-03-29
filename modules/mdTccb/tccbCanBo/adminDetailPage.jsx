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
import Loading from 'view/component/Loading';
class CanBoPage extends AdminPage {
    state = { item: null, create: false, load: true }
    componentDidMount() {
        T.hideSearchBox();
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
            this.setState({ load: false });
        });
    }

    setUp = (item) => {
        this.componentCaNhan.value(item);
        this.componentTTCongTac.value(item);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        if (this.urlSHCC) {
            caNhanData && congTacData && trinhDoData && this.props.updateStaff(this.urlSHCC, { ...caNhanData, ...congTacData, ...trinhDoData, userModified: this.emailCanBo, lastModified: new Date().getTime() });
        } else {
            caNhanData && congTacData && trinhDoData && this.props.createStaff({ ...caNhanData, ...congTacData, ...trinhDoData, userModified: this.emailCanBo, lastModified: new Date().getTime() }, () => this.props.history.push('/user/tccb/staff'));
        }
    }


    render() {
        const item = this.props.staff?.selectedItem,
            permission = this.getUserPermission('staff');
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Hồ sơ cá nhân',
            subTitle: <span style={{ color: 'blue' }}>{item ? `Cán bộ: ${item?.ho} ${item?.ten} (${item?.shcc} - ${item?.email})` : ''}</span>,
            breadcrumb: [
                <Link key={0} to='/user/staff'>Cán bộ</Link>,
                'Lý lịch cán bộ',
            ],
            content:
                <>
                    {this.state.load && <Loading />}
                    {!this.state.create ? <>
                        <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.write} />
                        <ComponentQuanHe ref={e => this.componentQuanHe = e} userEdit={false} />
                        <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={false} />
                        <ComponentTrinhDo ref={e => this.componentTrinhDo = e} readOnly={!permission.write} userEdit={false} tccb={true} />
                    </> :
                        <>
                            <ComponentCaNhan ref={e => this.componentCaNhan = e} readOnly={!permission.write} create />
                            <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={false} create />
                        </>
                    }
                </>,
            backRoute: '/user/tccb/staff',
            onSave: this.save,
        });
    }

}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, updateStaff, createStaff, getDmQuanHeGiaDinhAll,
    createQuanHeCanBo, updateQuanHeCanBo, deleteQuanHeCanBo
};
export default connect(mapStateToProps, mapActionsToProps)(CanBoPage);