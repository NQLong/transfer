import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import ComponentCaNhan from 'modules/mdTccb/tccbCanBo/componentCaNhan';
import { updateSystemState } from 'modules/_default/_init/reduxSystem';
import { userGetStaff, updateStaffUser } from 'modules/mdTccb/tccbCanBo/redux';
import ComponentQuanHe from 'modules/mdTccb/tccbCanBo/componentQuanHe';
import ComponentTrinhDo from 'modules/mdTccb/tccbCanBo/componentTrinhDo';
import ComponentTTCongTac from 'modules/mdTccb/tccbCanBo/componentTTCongTac';


class ProfileCanBo extends AdminPage {
    componentDidMount() {
        T.ready(() => {
            if (this.props.system && this.props.system.user) {
                const user = this.props.system.user;
                this.emailCanBo = user.email ? user.email : null;
                this.props.userGetStaff(user.email, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    } else {
                        data.item && this.setUp(data.item);
                    }
                });
            }
        });
    }

    setUp = (item) => {
        this.componentCaNhan.value(item);
        this.componentQuanHe.value(item.email, item.phai, item.shcc);
        this.componentTrinhDo.value(item);
        this.componentTTCongTac.value(item);
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        const trinhDoData = this.componentTrinhDo.getAndValidate();
        this.emailCanBo && this.props.updateStaffUser(this.emailCanBo, { ...caNhanData, ...trinhDoData});
    };
    render = () => {
        const item = this.props.staff?.userItem;
        return this.renderPage({
            title: `Thông tin cá nhân${item?.shcc ? `: ${item?.ho} ${item?.ten}` : ''}`,
            content: <>
                <ComponentCaNhan ref={e => this.componentCaNhan = e} userEdit={false} />
                <ComponentQuanHe ref={e => this.componentQuanHe = e} userEdit={true}/>
                <ComponentTTCongTac ref={e => this.componentTTCongTac = e} userEdit={true} />
                <ComponentTrinhDo ref={e => this.componentTrinhDo = e} userEdit={true} />
            </>,
            onSave: this.save,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, staff: state.staff });
const mapActionsToProps = {
    userGetStaff, updateStaffUser, updateSystemState
};
export default connect(mapStateToProps, mapActionsToProps)(ProfileCanBo);
