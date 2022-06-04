import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormFileBox } from 'view/component/AdminPage';

class TcHocPhiImportPage extends AdminPage {
    render() {
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Import dữ liệu học phí',
            content: <>
                <div className='tile'>
                    <FormFileBox className='col-12' />
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiImportPage);