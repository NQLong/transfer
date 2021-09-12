import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDMTinhThanhPho } from './reduxTinhThanhPho';
import EditModal from './adminTinhThanhPho';

class DMTinhThanhPhoImportPage extends React.Component {
    state = { data: [], message: '', saving: false };
    editModal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
    }

    onSuccess = (response) =>
        this.setState({ data: response.data, message: <p className='text-center' style={{ color: 'green' }}>{response.data.length} hàng được tải lên thành công</p> });

    onError = () => T.notify('Upload file bị lỗi!', 'danger');

    edit = (e, item) => {
        e.preventDefault();
        this.editModal.current.show(item);
    };

    update = (condition, changes, done) => {
        const data = JSON.parse(JSON.stringify(this.state.data));
        for (let i = 0; i < data.length; i++)
            if (data[i].ma == condition.ma) {
                data[i] = Object.assign({}, data[i], changes);
                this.setState({ data });
                done && done(null, data[i]);
                return;
            }
        done && done('Item not found');
    };

    delete = (e, index) => {
        e.preventDefault();
        const ten = this.state.data[index].ten;
        T.confirm('Tỉnh/thành phố', `Bạn có chắc bạn muốn xóa tỉnh/thành phố ${ten ? `<b>${ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                const data = this.state.data;
                data.splice(index, 1);
                this.setState({ data });
                T.alert(`Xoá tỉnh/thành phố ${ten} thành công!`, 'success', false, 800);
            }
        });
    };

    save = (e) => {
        let doSave = (isOverride) => {
            let data = JSON.parse(JSON.stringify(this.state.data));
            this.setState({ saving: true });
            this.props.createMultiDMTinhThanhPho(data, isOverride, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''}tỉnh/thành phố thành công!`, 'success');
                    this.props.history.push('/user/danh-muc/tinh-thanh-pho');
                }
                this.setState({ saving: false });
            });
        };
        e.preventDefault();
        T.confirm3('Cập nhật dữ liệu', 'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!', 'warning', 'Ghi đè', 'Không ghi đè', isOverride => {
            if (isOverride !== null) {
                if (isOverride)
                    T.confirm('Ghi đè dữ liệu', 'Bạn có chắc chắn muốn ghi đè dữ liệu?', 'warning', true, isConfirm => {
                        if (isConfirm) doSave('TRUE');
                    });
                else doSave('FALSE');
            }
        });
    };

    changeActive = (item, key) => this.update({ ma: item.ma }, { [key]: !item[key] }, () => T.notify('Cập nhật tỉnh/thành phố thành công!', 'success'));

    render() {
        const { data } = this.state;
        let table = 'Không có dữ liệu!';
        if (data && data.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive' style={{ maxHeight: '600px', overflow: 'auto' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ minWidth: '50%' }} nowrap='true'>Mã tỉnh/thành phố</th>
                            <th style={{ minWidth: '50%' }} nowrap='true'>Tên tỉnh/thành phố</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item['ma']}</a></td>
                                <td>{item['ten']}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, index)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-user' /> Tải lên file cập nhật tỉnh/thành phố</h1>
                        <p />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <li className='breadcrumb-item'>
                            <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        </li>
                        <li className='breadcrumb-item'>Tải lên file cập nhật tỉnh/thành phố</li>
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-6 offset-md-3'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <FileBox ref={this.fileBox} postUrl='/user/upload' uploadType='DMTinhThanhPhoFile' ajax={true} userData='dmTinhThanhPhoImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.onSuccess} error={this.onError} accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' />
                                {this.state.message}
                            </div>
                            <div className='tile-footer text-right'>
                                <a href='/download/SampleUploadDMTinhThanhPho.xlsx' className='btn btn-info'>Tải xuống file mẫu</a>
                            </div>
                        </div>
                    </div>
                </div>
                {data && data.length ? <div className='tile'>{table}</div> : null}
                <Link to='/user/danh-muc/tinh-thanh-pho' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' disabled={!this.state.data.some(x => x) || this.state.saving} style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <EditModal ref={this.editModal} update={this.update} />
            </main>
        );
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = { createMultiDMTinhThanhPho };
export default connect(mapStateToProps, mapActionsToProps)(DMTinhThanhPhoImportPage);
