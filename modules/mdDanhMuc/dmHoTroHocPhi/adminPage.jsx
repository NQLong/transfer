import React from 'react';
import { connect } from 'react-redux';
import { getDmHoTroHocPhiAll, deleteDmHoTroHocPhi, createDmHoTroHocPhi, updateDmHoTroHocPhi } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmHoTroHocPhiMa').focus());
        }, 250));
    }

    show = (item) => {
        let { ma, tyLe, ghiChu, kichHoat } = item ? item : { ma: '', tyLe: null, ghiChu: '', kichHoat: true };
        $('#dmHoTroHocPhiMa').val(ma);
        $('#dmHoTroHocPhiTyLe').val(tyLe);
        $('#dmHoTroHocPhiGhiChu').val(ghiChu);
        this.setState({ kichHoat });

        $(this.modal.current).attr('data-id', ma).modal('show');
    };

    save = e => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-id'),
            changes = {
                ma: $('#dmHoTroHocPhiMa').val().trim(),
                tyLe: Number($('#dmHoTroHocPhiTyLe').val().trim()),
                ghiChu: $('#dmHoTroHocPhiGhiChu').val(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã danh mục bị trống');
            $('#dmHoTroHocPhiMa').focus();
        } else {
            if (ma) {
                this.props.updateDmHoTroHocPhi(ma, changes);
            } else {
                this.props.createDmHoTroHocPhi(changes);
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
                            <h5 className='modal-title'>Thông tin danh mục hỗ trợ học phí</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmHoTroHocPhiMa'>Mã</label>
                                <input className='form-control' id='dmHoTroHocPhiMa' type='text' placeholder='Mã danh mục' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmHoTroHocPhiTyle'>Tỷ lệ</label>
                                <input className='form-control' id='dmHoTroHocPhiTyLe' type='text' placeholder='Tỷ lệ' readOnly={readOnly} />
                            </div>
                            <div className='form-group' style={{ margin: 0 }}>
                                <label htmlFor='dmHoTroHocPhiGhiChu'>Ghi chú</label>
                                <textarea className='form-control' id='dmHoTroHocPhiGhiChu' style={{ minHeight: 40 }} placeholder='Ghi chú' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmHoTroHocPhiActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmHoTroHocPhiActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
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

class DmHoTroHocPhiPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmHoTroHocPhiAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmHoTroHocPhi(item.ma, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa hỗ trợ học phí', 'Bạn có chắc bạn muốn xóa hỗ trợ học phí này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHoTroHocPhi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmHoTroHocPhi:write'),
            permissionDelete = currentPermissions.includes('dmHoTroHocPhi:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmHoTroHocPhi && this.props.dmHoTroHocPhi.items ? this.props.dmHoTroHocPhi.items : [];
        if (items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>Mã</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Tỷ lệ (%)</th>
                            <th style={{ width: '100%' }}>Ghi chú</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ma}</td>
                                <td style={{ textAlign: 'right' }}><a href='#' onClick={e => this.edit(e, item)}>{item.tyLe}</a></td>
                                <td>{item.ghiChu}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={e => permissionWrite && this.changeActive(item)} />
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Hỗ trợ học phí</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Hỗ trợ học phí
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmHoTroHocPhi={this.props.dmHoTroHocPhi}
                    createDmHoTroHocPhi={this.props.createDmHoTroHocPhi} updateDmHoTroHocPhi={this.props.updateDmHoTroHocPhi} />
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

const mapStateToProps = state => ({ system: state.system, dmHoTroHocPhi: state.dmHoTroHocPhi });
const mapActionsToProps = { getDmHoTroHocPhiAll, deleteDmHoTroHocPhi, createDmHoTroHocPhi, updateDmHoTroHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(DmHoTroHocPhiPage);