import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import ComponentPhiaTruong from './ComponentPhiaTruong';
import { handleSoHopDongTrachNhiem, getHopDongTrachNhiem } from './redux';
class HDTN_Details extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/hop-dong-trach-nhiem/:ma');
            this.ma = route.parse(window.location.pathname).ma;
            if (this.ma) this.setValue();

        });
    }

    setValue = () => {
        this.props.getHopDongTrachNhiem(this.ma, item => {
            this.phiaTruong.setVal(item.hopDong);
        });
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-info-circle',
            title: 'Hợp đồng Trách nhiệm: ' + (this.ma != 'new' ? 'Cập nhật' : 'Tạo mới'),
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='user/tccb/hop-dong-lao-dong'>Hợp đồng trách nhiệm</Link>,
                this.ma != 'new' ? 'Cập nhật' : 'Tạo mới'
            ],
            content: <>
                <ComponentPhiaTruong ref={e => this.phiaTruong = e} />
            </>
        });
    }
}
const mapStateToProps = state => ({ system: state.system, qtHopDongTrachNhiem: state.tccb.qtHopDongTrachNhiem });
const mapActionsToProps = {
    handleSoHopDongTrachNhiem, getHopDongTrachNhiem
};
export default connect(mapStateToProps, mapActionsToProps)(HDTN_Details);