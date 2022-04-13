import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class DtDsMonMoEditPage extends AdminPage {
    state = { isCreate: false }

    componentDidMount() {
        const route = T.routeMatcher('/user/dao-tao/danh-sach-mon-mo/:id').parse(window.location.pathname),
            staff = this.props.system.user.staff;
        this.setState({
            staff,
            isCreate: (route.id == 'new')
        });
    }
    render() {

        return this.renderPage({
            title: <>Mở môn học: <small>{this.state.isCreate ? 'Đợt đăng ký mới' : 'Chỉnh sửa đợt đã đăng ký'}</small></>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Phòng đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/danh-sach-mon-mo'>Danh sách môn mở</Link>,
                this.state.isCreate ? 'Đợt đăng ký mới' : 'Chỉnh sửa'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-title'>Danh sách môn của Khoa/Bộ môn:</div>
                </div>
            </>

        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtDsMonMo: state.daoTao.dtDsMonMo });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(DtDsMonMoEditPage);