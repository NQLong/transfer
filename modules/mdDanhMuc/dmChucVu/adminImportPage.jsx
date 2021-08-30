import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDmChucVu } from './redux';

class EditModal extends React.Component {
    state = { index: -1, isActive: null };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => this.setState({ index: -1 }));
        })
    }

    show = (index, item) => {
        let { ma, ten, kichHoat, phuCap, ghiChu } = item ? item : { ma: null, ten: '', kichHoat: 1, phuCap: null, ghiChu: '' };
        $('#maChucVuImport').val(ma);
        $('#tenChucVuImport').val(ten);
        $('#phuCapImport').val(phuCap);
        $('#ghiChuImport').val(ghiChu);
        this.setState({ isActive: kichHoat == 1, index: index });

        $(this.modal.current).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        let changes = {
            ma: $('#maChucVuImport').val().trim(),
            ten: $('#tenChucVuImport').val().trim(),
            phuCap: $('#phuCapImport').val().trim(),
            ghiChu: $('#ghiChuImport').val().trim(),
            kichHoat: this.state.isActive ? 1 : 0,
        };
        this.props.update(this.state.index, changes, () => $(this.modal.current).modal('hide'));
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Cập nhật danh mục chức vụ</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='maChucVuImport'>Mã chức vụ</label>
                                <input className='form-control' id='maChucVuImport' placeholder='Mã chức vụ' type='text' auto-focus='' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='tenChucVuImport'>Tên chức vụ</label>
                                <input className='form-control' id='tenChucVuImport' placeholder='Tên chức vụ' type='text' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='phuCapImport'>Phụ cấp</label>
                                <input className='form-control' id='phuCapImport' placeholder='Phụ cấp' type='text' />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='kichHoatImport'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='kichHoatImport' checked={this.state.isActive} onChange={() => this.setState({ isActive: !this.state.isActive })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor='ghiChuImport'>Ghi chú</label>
                                <input className='form-control' id='ghiChuImport' placeholder='Ghi chú' type='text' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

class DmChucVuImportPage extends React.Component {
    state = { dmChucVu: [], message: '', isDisplay: true };
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
    }

    onSuccess = (response) => {
        this.setState({
            dmChucVu: response.element,
            message: <p className='text-center' style={{ color: 'green' }}>{response.element.length} hàng được tải lên thành công</p>,
            isDisplay: false
        });
    };

    edit = (e, item, index) => {
        e.preventDefault();
        this.modal.current.show(index, item);
    };

    update = (index, changes, done) => {
        const dmChucVu = this.state.dmChucVu, currentValue = dmChucVu[index];
        const updateValue = Object.assign({}, currentValue, changes);
        dmChucVu.splice(index, 1, updateValue);
        this.setState({ dmChucVu });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const dmChucVu = this.state.dmChucVu;
        dmChucVu.splice(index, 1);
        this.setState({ dmChucVu });
    };

    save = (e) => {
        const doSave = (isOverride) => {
            const data = this.state.dmChucVu;
            this.props.createMultiDmChucVu(data, isOverride, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} chức vụ thành công!`, 'success');
                    this.props.history.push('/user/danh-muc/chuc-vu');
                }
            })
        }
        e.preventDefault();
        T.confirm3('Cập nhật dữ liệu', 'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!', 'warning', 'Ghi đè', 'Không ghi đè', isOverride => {
            if (isOverride !== null) {
                if (isOverride)
                    T.confirm('Ghi đè dữ liệu', 'Bạn có chắc chắn muốn ghi đè dữ liệu?', 'warning', true, isConfirm => {
                        if (isConfirm) doSave('TRUE');
                    })
                else doSave('FALSE');
            }
        })
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    renderFileUpload = () => {
        return (
            <div style={{
                display: this.state.isDisplay ? 'block' : 'none'
            }}>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Tải lên file danh mục chức vụ</h1>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-6 offset-md-3'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <FileBox ref={this.fileBox} postUrl='/user/upload' ajax={true} uploadType='DmChucVuFile' userData='dmChucVuImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.onSuccess} />
                                {this.state.message}
                            </div>
                            <div className='tile-footer text-right'>
                                <a href='/download/Sample_Dm_ChucVu.xlsx' className='btn btn-info'>Tải xuống file mẫu</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { dmChucVu } = this.state;
        let table = 'Không có dữ liệu!';
        if (dmChucVu && dmChucVu.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive' style={{ maxHeight: '600px', overflow: 'scroll' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <td style={{ width: 'auto' }}>Mã</td>
                            <td style={{ width: '50%' }}>Tên</td>
                            <td style={{ width: '50%' }}>Ghi chú</td>
                            <td style={{ width: 'auto' }} nowrap='true'>Phụ cấp</td>
                            <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                            <td style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</td>
                        </tr>
                    </thead>
                    <tbody>
                        {dmChucVu.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item, index)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td>{item.ghiChu}</td>
                                <td style={{ textAlign: 'right' }}>{item.phuCap ? item.phuCap : 0}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => this.update(index, item.kichHoat = !item.kichHoat)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-trash-o fa-lg' />
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
                {this.renderFileUpload()}
                {dmChucVu && dmChucVu.length ? (
                    <div className='tile'>
                        {table}
                    </div>
                ) : null}
                <Link to='/user/danh-muc/chuc-vu' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button className='btn btn-success btn-circle' type='button' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.showUpload}>
                    <i className='fa fa-lg fa-cloud-upload' />
                </button>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <EditModal ref={this.modal} update={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { createMultiDmChucVu };
export default connect(mapStateToProps, mapActionsToProps)(DmChucVuImportPage);
