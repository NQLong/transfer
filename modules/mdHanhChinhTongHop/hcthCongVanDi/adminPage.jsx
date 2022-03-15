import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable} from 'view/component/AdminPage';
class HcthCongVanDi extends AdminPage {    
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    render() {
        const table = renderTable({
            getDataSource: () => [{}], stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto'}}>#</th>
                    <th style={{ width: 'auto'}}>Nội dung</th>
                    <th style={{ width: 'auto'}}>Ngày gửi</th>
                    <th style={{ width: 'auto'}}>Ngày ký</th>
                    <th style={{ width: 'auto'}}>Đơn vị gửi</th>
                    <th style={{ width: 'auto'}}>Đơn vị nhận</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hơp</Link>,
                'Công văn đi'
            ],
            content: <>{table}</>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanDi);
