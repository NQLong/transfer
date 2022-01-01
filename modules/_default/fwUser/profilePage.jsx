import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import ComponentCaNhan from 'modules/mdTccb/tccbCanBo/componentCaNhan';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { userGetStaff, updateStaffUser } from 'modules/mdTccb/tccbCanBo/redux';
import ComponentQuanHe from 'modules/mdTccb/tccbCanBo/componentQuanHe';
import ComponentTrinhDo from 'modules/mdTccb/tccbCanBo/componentTrinhDo';
import ComponentTTCongTac from 'modules/mdTccb/tccbCanBo/componentTTCongTac';
import ProfileCommon from './componentNotStaff';
import Loading from 'view/component/Loading';

class ProfileCanBo extends AdminPage {
    state = { canBo: null, isLoad: true };
    componentDidMount() {
        T.ready(() => {
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
                        this.profileCommon.value(user);
                    }
                });
            }
        });
    }

    setUp = (item) => {
        this.setState({ canBo: item, isLoad: false });
        this.componentCaNhan.value(item);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
        this.componentTTCongTac.value(item);
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const congTacData = this.componentTTCongTac.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        this.emailCanBo && this.props.updateStaffUser(this.emailCanBo, { ...caNhanData, ...trinhDoData, ...congTacData});
    };
    render = () => {
        const item = this.props.staff?.userItem;
        return this.renderPage({
            title: `Thông tin cá nhân${item?.shcc ? `: ${item?.ho} ${item?.ten}` : ''}`,
            content:
                <>
                    {this.state.isLoad && <Loading />}
                    {!this.state.canBo && <ProfileCommon ref={e => this.profileCommon = e} />}
                    {this.state.canBo && <>
                        <ComponentCaNhan ref={e => this.componentCaNhan = e} userEdit={false} />
                        <ComponentQuanHe ref={e => this.componentQuanHe = e} userEdit={true} />
                        <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={true} />
                        <ComponentTrinhDo ref={e => this.componentTrinhDo = e} userEdit={true} />
                    </>}
                </>,
            onSave: this.state.canBo && this.save,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.staff });
const mapActionsToProps = {
    userGetStaff, updateStaffUser, updateSystemState
};
export default connect(mapStateToProps, mapActionsToProps)(ProfileCanBo);
