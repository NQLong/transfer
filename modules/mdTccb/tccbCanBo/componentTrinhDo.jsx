import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import { getStaffEdit } from './redux';

class ComponentTrinhDo extends AdminPage {
    data = [];
    value(item) {
        this.data = item;
    }

    render() {

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về trình độ</h3>
                <div className='tile-body row'>
                    <FormTextBox ref={e=>this.trinhDoPhoThong = e} label='Trình độ giáo dục phổ thông' className='col-md-6' />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentTrinhDo);