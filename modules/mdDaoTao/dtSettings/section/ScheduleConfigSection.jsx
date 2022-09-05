import React from 'react';
import { connect } from 'react-redux';
import { FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { getDtSettingsKeys, updateDtSettingsKeys } from '../redux';

const listKey = ['tkbSoLopMin', 'tkbSoLopMax', 'tkbSoTietBuoiMin', 'tkbSoTietBuoiMax', 'tkbSoBuoiTuanMin', 'tkbSoBuoiTuanMax', 'tkbSoLuongDuKienMin', 'tkbSoLuongDuKienMax'];
class ScheduleConfigSection extends React.Component {

    setValue = (data) => {
        Object.keys(data).forEach(key => {
            if (listKey.includes(key)) {
                this[key].value(data[key]);
            }
        });
    }

    onSave = (e) => {
        e.preventDefault();
        T.confirm('Lưu ý', 'Bạn có chắc chắn muốn thay đổi các thông số này không? Nếu không rõ vui lòng liên hệ quản trị viên.', 'warning', true, isConfirm => {
            if (isConfirm) {
                try {
                    let changes = {};
                    listKey.forEach(key => {
                        changes[key] = getValue(this[key]);
                    });
                    this.props.updateDtSettingsKeys(changes);
                } catch (error) {
                    T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                }
            }
        });
    }
    render() {
        return (
            <div className='tile'>
                <h4 className='tile-title'>Thông số thời khoá biểu</h4>
                <div className='tile-body'>
                    <div className='row'>
                        <FormTextBox type='number' ref={e => this.tkbSoLopMin = e} label='Số lớp/môn tối thiểu' className='col-md-6' required />
                        <FormTextBox type='number' ref={e => this.tkbSoLopMax = e} label='Số lớp/môn tối đa' className='col-md-6' required />

                        <FormTextBox type='number' ref={e => this.tkbSoTietBuoiMin = e} label='Số tiết /buổi tối thiểu' className='col-md-6' required />
                        <FormTextBox type='number' ref={e => this.tkbSoTietBuoiMax = e} label='Số tiết /buổi tối đa' className='col-md-6' required />

                        <FormTextBox type='number' ref={e => this.tkbSoBuoiTuanMin = e} label='Số buổi /tuần tối thiểu' className='col-md-6' required />
                        <FormTextBox type='number' ref={e => this.tkbSoBuoiTuanMax = e} label='Số buổi /tuần tối đa' className='col-md-6' required />

                        <FormTextBox type='number' ref={e => this.tkbSoLuongDuKienMin = e} label='Số lượng dự kiến /lớp tối thiểu' className='col-md-6' required />
                        <FormTextBox type='number' ref={e => this.tkbSoLuongDuKienMax = e} label='Số lượng dự kiến /lớp tối đa' className='col-md-6' required />
                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={this.onSave}>
                        <i className='fa fa-lg fa-save' /> Lưu thay đổi
                    </button>

                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtSettingsKeys, updateDtSettingsKeys };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ScheduleConfigSection);