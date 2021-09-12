import React from 'react';
import { connect } from 'react-redux';
import { getDmKinhPhiNuocNgoaiAll, deleteDmKinhPhiNuocNgoai, createDmKinhPhiNuocNgoai, updateDmKinhPhiNuocNgoai } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmKinhPhiNuocNgoaiMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kichHoat: true };
        $('#dmKinhPhiNuocNgoaiMa').val(ma);
        $('#dmKinhPhiNuocNgoaiTen').val(ten);
        $('#dmKinhPhiNuocNgoaiGhiChu').val(ghiChu);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmKinhPhiNuocNgoaiMa').val().trim(),
                ten: $('#dmKinhPhiNuocNgoaiTen').val().trim(),
                ghiChu: $('#dmKinhPhiNuocNgoaiGhiChu').val().trim(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            $('#dmKinhPhiNuocNgoaiMa').focus();
        } else if (changes.ten == '') {
            T.notify('Mô tả danh mục bị trống');
            $('#dmKinhPhiNuocNgoaiTen').focus();
        } else {
            if (ma) {
                this.props.updateDmKinhPhiNuocNgoai(ma, changes);
            } else {
                this.props.createDmKinhPhiNuocNgoai(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục Kinh phí đi nước ngoài</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmKinhPhiNuocNgoaiMa'>Mã</label>
                                <input className='form-control' id='dmKinhPhiNuocNgoaiMa' type='text' placeholder='Mã danh mục' maxLength={2} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmKinhPhiNuocNgoaiTen'>Tên</label>
                                <input className='form-control' id='dmKinhPhiNuocNgoaiTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmKinhPhiNuocNgoaiGhiChu'>Ghi chú</label>
                                <input className='form-control' id='dmKinhPhiNuocNgoaiGhiChu' type='text' placeholder='Ghi chú' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                <label htmlFor='dmMucDichNuocNgoaiActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmMucDichNuocNgoaiActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmKinhPhiNuocNgoaiPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmKinhPhiNuocNgoaiAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmKinhPhiNuocNgoai(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa kinh phí đi nước ngoài', 'Bạn có chắc bạn muốn xóa kinh phí này?', true, isConfirm =>
            isConfirm && this.props.deleteDmKinhPhiNuocNgoai(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmKinhPhiNuocNgoai:write'),
            permissionDelete = currentPermissions.includes('dmKinhPhiNuocNgoai:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmKinhPhiNuocNgoai && this.props.dmKinhPhiNuocNgoai.items ? this.props.dmKinhPhiNuocNgoai.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: '40%' }}>Tên</th>
                            <th style={{ width: '60%' }}>Ghi chú</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ten}</a></td>
                                <td>{item.ghiChu}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' />
                                            </a>}
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Kinh phí đi nước ngoài</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Kinh phí đi nước ngoài
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmKinhPhiNuocNgoai={this.props.dmKinhPhiNuocNgoai}
                    createDmKinhPhiNuocNgoai={this.props.createDmKinhPhiNuocNgoai} updateDmKinhPhiNuocNgoai={this.props.updateDmKinhPhiNuocNgoai} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmKinhPhiNuocNgoai: state.dmKinhPhiNuocNgoai });
const mapActionsToProps = { getDmKinhPhiNuocNgoaiAll, deleteDmKinhPhiNuocNgoai, createDmKinhPhiNuocNgoai, updateDmKinhPhiNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmKinhPhiNuocNgoaiPage);