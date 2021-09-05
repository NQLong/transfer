import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDmBoMon } from './redux';

const schema = {
    ma: { type: 'text', title: 'Mã bộ môn' },
    ten: { type: 'text', title: 'Tên bộ môn' },
    tenTiengAnh: { type: 'text', title: 'Tên tiếng Anh bộ môn' },
    maDv: { type: 'text', title: 'Mã đơn vị' },
    qdThanhLap: { type: 'text', title: 'QĐ thành lập' },
    qdXoaTen: { type: 'text', title: 'QĐ xóa tên' },
    kichHoat: { type: 'number', title: 'Kích hoạt' },
    ghiChu: { type: 'text', title: 'Ghi chú' },
};

class EditModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { index: -1 };
        this.modal = React.createRef();

        Object.keys(schema).forEach(key => this[key] = React.createRef());
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => this.setState({ index: -1 }));
        });
    }

    show = (index, item) => {
        let { ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, kichHoat, ghiChu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', maDv: '', qdThanhLap: '', qdXoaTen: '', kichHoat: 0, ghiChu: '' };

        $('#ma').val(ma),
            $('#ten').val(ten),
            $('#tenTiengAnh').val(tenTiengAnh),
            $('#maDv').val(maDv),
            $('#qdThanhLap').val(qdThanhLap),
            $('#qdXoaTen').val(qdXoaTen),
            $('#ghiChu').val(ghiChu);

        this.setState({ index });
        $(this.modal.current).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const
            changes = {
                ma: $('#ma').val().trim(),
                ten: $('#ten').val().trim(),
                tenTiengAnh: $('#tenTiengAnh').val().trim(),
                maDv: $('#maDv').val().trim(),
                qdThanhLap: $('#qdThanhLap').val().trim(),
                qdXoaTen: $('#qdXoaTen').val().trim(),
                ghiChu: $('#ghiChu').val().trim(),
            };
        if (changes.ma == '') {
            T.notify('Mã bộ môn bị trống!', 'danger');
            $('#ma').focus();
        } else if (changes.maDv == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            $('#maDv').focus();
        } else {
            this.props.update(this.state.index, changes, () => $(this.modal.current).modal('hide'));
        }
        e.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Cập nhật bộ môn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='col-md-12'>
                                <div className='tile'>
                                    <div className='tile-body'>
                                        <div className='form-group'>
                                            <label className='control-label'>Mã bộ môn</label>
                                            <input className='form-control' type='text' placeholder='Mã bộ môn' id='ma' />
                                        </div>
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='control-label'>Tên bộ môn</label>
                                                    <input className='form-control' type='text' placeholder='Tên bộ môn' id='ten' />
                                                </div>
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='form-group'>
                                                    <label className='control-label'>Tên tiếng Anh bộ môn</label>
                                                    <input className='form-control' type='text' placeholder='Tên tiếng Anh' id='tenTiengAnh' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label'>Mã đơn vị</label>
                                            <input className='form-control' type='text' placeholder='Mã đơn vị' id='maDv' />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label'>Quyết định thành lập</label>
                                            <input className='form-control' type='text' placeholder='QĐ thành lập' id='qdThanhLap' />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label'>Quyết định xóa tên</label>
                                            <input className='form-control' type='text' placeholder='QĐ xóa tên' id='qdXoaTen' />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label'>Ghi chú</label>
                                            <input className='form-control' type='text' placeholder='Ghi chú' id='ghiChu' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmBoMonImportPage extends React.Component {
    state = { dmBoMon: [], message: '', isDisplay: true };
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
    }

    onSuccess = (response) => {
        this.setState({
            dmBoMon: response.element,
            message: <p className='text-center' style={{ color: 'green' }}>{response.element.length} hàng được tải lên thành công</p>,
            isDisplay: false
        });
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.current.show(index, item);
    };

    update = (index, changes, done) => {
        const dmBoMon = this.state.dmBoMon, currentValue = dmBoMon[index];
        const updateValue = Object.assign({}, currentValue, changes);
        dmBoMon.splice(index, 1, updateValue);
        this.setState({ dmBoMon });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const dmBoMon = this.state.dmBoMon;
        dmBoMon.splice(index, 1);
        this.setState({ dmBoMon });
    };

    save = (e) => {
        e.preventDefault();
        this.props.createMultiDmBoMon(this.state.dmBoMon, () => {
            T.notify('Cập nhật thành công!', 'success');
            this.props.history.push('/user/dm-bo-mon');
        });
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    onChangeCheckBox = (e, index) => {
        let { dmBoMon } = this.state;
        dmBoMon[index].kichHoat = dmBoMon[index].kichHoat === 1 ? 0 : 1;
        this.setState({ dmBoMon });
    }

    renderFileUpload = () => (
        <div style={{ display: this.state.isDisplay ? 'block' : 'none' }}>
            <div className='app-title'>
                <h1><i className='fa fa-user' /> Tải lên file Danh mục - bộ môn</h1>
            </div>
            <div className='row'>
                <div className='col-12 col-md-6 offset-md-3'>
                    <div className='tile'>
                        <div className='tile-body'>
                            <FileBox ref={this.fileBox} postUrl='/user/upload' uploadType='dmBoMonFile' ajax={true} userData='dmBoMonImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }} success={this.onSuccess} />
                            {this.state.message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    render() {
        const { dmBoMon } = this.state;
        let table = 'Không có dữ liệu!';
        if (dmBoMon && dmBoMon.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive' style={{ maxHeight: '600px', overflow: 'scroll' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }}>Mã bộ môn </th>
                            <th style={{ width: '50%' }}>Tên bộ môn </th>
                            <th style={{ width: '50%' }}>Tên tiếng Anh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã đơn vị </th>
                            <th style={{ width: 'auto' }} nowrap='true'>Quyết định thành lập </th>
                            <th style={{ width: 'auto' }} nowrap='true'>Quyết định xóa tên</th>
                            <td style={{ width: 'auto' }} nowrap='true'>Kích hoạt</td>
                            {/* <th style={{ width: 'auto' }}>Ghi chú</th> */}
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dmBoMon.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <a href='#' onClick={(e) => this.showEdit(e, index, item)}>{item.ma}</a>
                                </td>
                                <td nowrap='true'>{item.ten ? item.ten : ''}</td>
                                <td nowrap='true'>{item.tenTiengAnh ? item.tenTiengAnh : ''}</td>
                                <td nowrap='true'>{item.maDv ? item.maDv : ''}</td>
                                <td nowrap='true'>{item.qdThanhLap ? item.qdThanhLap : ''}</td>
                                <td nowrap='true'>{item.qdXoaTen ? item.qdXoaTen : ''}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={(e) => this.onChangeCheckBox(e, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {/* <td nowrap='true'>{item.ghiChu ? item.ghiChu : ''}</td> */}
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showEdit(e, index, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, index)}>
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
                {dmBoMon && dmBoMon.length ? <div className='tile'>{table}</div> : null}

                <Link to='/user/dm-bo-mon' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <EditModal ref={this.modal} update={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { createMultiDmBoMon };
export default connect(mapStateToProps, mapActionsToProps)(DmBoMonImportPage);
