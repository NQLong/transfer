import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { connect } from 'react-redux';
import { send } from './redux';
export class MailPage extends AdminPage {
    state = { file: null }
    onSuccess = (data) => {
        this.setState({ file: data.file });
    }

    onSend = () => {
        this.props.send({ file: this.state.file });
    }

    render() {
        return this.renderPage({
            title: 'Gửi hướng dẫn sinh viên',
            content: <div>
                <div className='tile'>
                    <h3 className='tile-header' style={{ display: this.state.loading ? 'none' : 'block' }}>Tải lên danh sách sinh viên</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12' >
                            <FileBox postUrl='/user/upload' uploadType='tcMail' userData={'tcMail'}
                                accept='application/pdf'
                                style={{ width: '80%', margin: '0 auto' }}
                                ajax={true} success={this.onSuccess} />
                        </div>
                        <div className='col-md-12 d-flex justify-content-end'>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.onSend()} disabled={!this.state.file}><i className='fa fa-lg fa-paper-plane' />Gửi</button>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { send };
export default connect(mapStateToProps, mapActionsToProps)(MailPage);