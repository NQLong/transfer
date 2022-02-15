import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { userGetStaff, updateStaffUser } from 'modules/mdTccb/tccbCanBo/redux';
import ProfileCommon from './componentNotStaff';
import Loading from 'view/component/Loading';
import SubMenusPage from 'view/component/SubMenusPage';

class ProfileCanBo extends AdminPage {
    state = { canBo: false, isLoad: true };
    componentDidMount() {
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const user = this.props.system.user;
                if (user.isStaff != 1) {
                    this.setState({ isLoad: false });
                    this.profileCommon.value(user);
                } else this.setState({ canBo: true });
            }
        });
    }

    render = () => {
        return this.state.canBo ? <SubMenusPage menuLink='/user' menuKey={1000} headerIcon='fa-user' /> : this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Thông tin cá nhân',
            content:
                <>
                    {this.state.isLoad && <Loading />}
                    <ProfileCommon ref={e => this.profileCommon = e} />
                </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    userGetStaff, updateStaffUser, updateSystemState
};
export default connect(mapStateToProps, mapActionsToProps)(ProfileCanBo);
