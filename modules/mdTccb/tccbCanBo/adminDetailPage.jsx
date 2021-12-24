import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStaffEdit, createStaff, updateStaff} from './redux';
import {ComponentCaNhan} from './componentCaNhan';
import { AdminPage } from 'view/component/AdminPage';

class CanBoPage extends AdminPage {
    state = { item: null }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/staff/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.urlSHCC = shcc && shcc != 'new' ? shcc : null;
            if (this.urlSHCC) {

                this.setState({ create: false });

                this.props.getStaffEdit(shcc, data => {
                    console.log(data.item);
                    if (data.error) {
                        T.notify('Lấy thông tin cán bộ bị lỗi!', 'danger');
                    }
                    else {
                        this.componentCaNhan.value(data.item);
                    }
                });
            } else {
                this.setState({ create: true });
            }
        });
    }

    save = () => {
        const caNhanData = this.componentCaNhan.getAndValidate();
        if (this.urlSHCC) {
            this.props.updateStaff(this.urlSHCC, { ...caNhanData});
        }
    }

    render() {
        const item = this.props.staff?.selectedItem;
        return this.renderPage({
            title: `Thông tin cá nhân${item?.shcc ? `: ${item?.ho} ${item?.ten}` : null}`,
            breadcrumb: [
                <Link key={0} to='/user/staff'>Cán bộ</Link>,
                'Lý lịch cán bộ',
            ],
            content: <>
                <ComponentCaNhan ref={e => this.componentCaNhan = e} userEdit={false} />
            </>,
             backRoute: '/user/staff',
             onSave: this.save,
        });
    }

}

const mapStateToProps = state => ({ staff: state.staff });
const mapActionsToProps = { getStaffEdit, updateStaff, createStaff };
export default connect(mapStateToProps, mapActionsToProps)(CanBoPage);