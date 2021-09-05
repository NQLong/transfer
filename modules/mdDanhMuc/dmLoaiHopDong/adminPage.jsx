import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiHopdong, getdmLoaiHopDongAll, updateDmLoaiHopDong, deleteDmLoaiHopDong } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { active: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmLoaiHopDongMa').focus());
        }, 250));
    }

    show = (item) => {
        const { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 0 };
        $('#dmLoaiHopDongMa').val(ma);
        $('#dmLoaiHopDongTen').val(ten);
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal.current).modal('hide')

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ten: $('#dmLoaiHopDongTen').val().trim(),
                ma: $('#dmLoaiHopDongMa').val().trim(),
                kichHoat: this.state.active ? '1' : '0',
            };

        if (changes.ten == '') {
            T.notify('Tên loại hợp đồng bị trống!', 'danger');
            $('#dmLoaiHopDongTen').focus();
        } else {
            if (ma) {
                this.props.updateDmLoaiHopDong(ma, changes);
            } else {
                this.props.createDmLoaiHopdong(changes);
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
                            <h5 className='modal-title'>Loại hợp đồng</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmLoaiHopDongMa'>Mã hợp đồng</label>
                                <input className='form-control' id='dmLoaiHopDongMa' type='number' placeholder='Mã Loại hợp đồng' readOnly={readOnly} />
                            </div>
                            <div id='dmDonViTiengViet' className='tab-pane fade show active'>
                                <div className='form-group'>
                                    <label htmlFor='dmLoaiHopDongTen'>Tên Loại hợp đồng</label>
                                    <input className='form-control' id='dmLoaiHopDongTen' type='text' placeholder='Tên Loại hợp đồng' readOnly={readOnly} />
                                </div>
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmDonViKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmDonViKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
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

class DmLoaiHopDongPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getdmLoaiHopDongAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLoaiHopDong(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục loại hợp đồng', 'Bạn có chắc bạn muốn xóa loại hợp đồng này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiHopDong(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLoaiHopDong:write'),
            permissionDelete = currentPermissions.includes('dmLoaiHopDong:delete');
        let table = 'Không có danh sách loại hợp đồng!',
            items = this.props.dmLoaiHopDong && this.props.dmLoaiHopDong.items ? this.props.dmLoaiHopDong.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                            <th style={{ width: '100%' }}>Tên loại hợp đồng</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Loại hợp đồng</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Loại hợp đồng
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmLoaiHopdong={this.props.createDmLoaiHopdong} updateDmLoaiHopDong={this.props.updateDmLoaiHopDong} />
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

const mapStateToProps = state => ({ system: state.system, dmLoaiHopDong: state.dmLoaiHopDong });
const mapActionsToProps = { getdmLoaiHopDongAll, createDmLoaiHopdong, updateDmLoaiHopDong, deleteDmLoaiHopDong };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiHopDongPage);