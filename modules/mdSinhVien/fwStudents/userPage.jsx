import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import { getSinhVienEditUser } from './redux';

class SinhVienPage extends AdminPage {

    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSinhVienEditUser(data => {
                if (data.error) {
                    T.notify('Lấy thông tin sinh viên bị lỗi!', 'danger');
                } else {
                    this.setState({ item: data.item });
                    this.setVal(data.item);
                }
            });
        });
    }

    setVal = (data = {}) => {
        this.mssv.value(data.mssv ? data.mssv : '');
        this.ho.value(data.ho ? data.ho : '');
        this.ten.value(data.ten ? data.ten : '');
    }

    render() {
        let item = this.props.system && this.props.system.user ? this.props.system.user.student : null;
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Lý lịch cá nhân sinh viên',
            subTitle: <i style={{ color: 'blue' }}>{item ? item.ho + ' ' + item.ten : ''}</i>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Lý lịch cá nhân sinh viên'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cơ bản</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' className='form-group col-md-4' readOnly />

                            <FormTextBox ref={e => this.ho = e} label='Họ và tên đệm' className='form-group col-md-4' />
                            <FormTextBox ref={e => this.ten = e} label='Tên' className='form-group col-md-4' />

                        </div>
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getSinhVienEditUser
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienPage);