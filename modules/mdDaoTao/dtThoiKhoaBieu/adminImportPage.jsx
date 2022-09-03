import React from 'react';
import { createMultipleThoiKhoaBieu } from './redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';


class DtThoiKhoaBieuImportPage extends AdminPage {
    state = {duplicateDatas: [], message: '', displayState: 'import', isDisplay: true };

    componentDidMount() {
        T.ready('/user/dao-tao');
    }

    render() {
        const {  displayState, duplicateDatas } = this.state;
        let table = 'Không có dữ liệu!';
        return this.renderPage(
            {
                icon: 'fa fa-calendar',
                title: 'Thời khoá biểu',
                breadcrumb: [<Link key={0} to='/user/dao-tao'>Đào tạo</Link>,<Link key={1} to='/user/dao-tao/thoi-khoa-bieu'>Thời khoá biểu</Link>, 'Import'],
                content:
                <>
                <div className='tile rows' style={{ textAlign: 'right',display: displayState == 'import' ? 'block' : 'none' }}>
                   
                    <FileBox postUrl='/user/upload' uploadType='DtThoiKhoaBieuData' userData={'DtThoiKhoaBieuData'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/dao-tao/thoi-khoa-bieu/download-template')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                    </button>
                </div>
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                    <p>MSSV trùng dữ liệu: {duplicateDatas.join(', ')}</p>
                    {table}
                </div>
                </>
            }
        );
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMultipleThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuImportPage);
