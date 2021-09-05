import React from 'react';
import { connect } from 'react-redux';
import { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue } from './redux';
import TextInput, { TextareaInput, BooleanInput } from 'view/component/Input';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = {};
    modal = React.createRef();
    ma = React.createRef();
    ten = React.createRef();
    ghiChu = React.createRef();
    kichHoat = React.createRef();
    saveBtn = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $('icon-button').on('click', function () {
            });
        }, 250));
    }

    show = (item = {}) => {
        $(this.modal.current).attr('data-id', item.ma).modal('show');
        this.ma.current.setVal(item.ma);
        this.ten.current.setVal(item.ten);
        this.ghiChu.current.setVal(item.ghiChu);
        this.kichHoat.current.setVal(item.kichHoat);

        let isUpdate = !$.isEmptyObject(item);
        this.setState({ isUpdate });
        this.ma.current.focus();
    };


    getValue = input => {
        const data = input.getVal();
        if (data) return data;
        if (input.required) throw { input };
        return data;
    };
    save = (e) => {
        e.preventDefault();
        const currentMaSoHuuTriTue = $(this.modal.current).attr('data-id');
        try {
            const data = {
                ma: this.getValue(this.ma.current),
                ten: this.getValue(this.ten.current),
                ghiChu: this.getValue(this.ghiChu.current),
                kichHoat: this.getValue(this.kichHoat.current)
            };
            const done = (error) => {
                this.setState({ btnSaveLoading: false }, () => {
                    !error && $(this.modal.current).modal('hide');
                });
            };
            this.setState({ btnSaveLoading: true }, () => {
                this.state.isUpdate ? this.props.update(currentMaSoHuuTriTue, data, done) : this.props.create(data, done);
            });
        }
        catch (error) {
            if (error.input) {
                error.input.focus();
                T.notify('<b>' + (error.input.label || 'Dữ liệu') + '</b> bị trống!!', 'danger');
            }
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        const { btnSaveLoading } = this.state;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục sở hữu trí tuệ</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <div className='form-group col-lg-12'><TextInput ref={this.ma} required label='Mã sở hữu trí tuệ' disabled={readOnly} /></div>
                            </div>
                            <div className='form-group'>
                                <div className='form-group col-lg-12'><TextInput ref={this.ten} label='Tên' disabled={readOnly} /></div>
                            </div>
                            <div className='form-group'>
                                <div className='form-group col-lg-12'><TextareaInput ref={this.ghiChu} label='Ghi chú' disabled={readOnly} /></div>
                            </div>
                            <div className='form-group'>
                                <div className='form-group col-lg-4'><BooleanInput ref={this.kichHoat} label='Kích hoạt&nbsp;' disabled={readOnly} /></div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' ref={this.saveBtn} className='btn btn-primary' onClick={this.save} disabled={btnSaveLoading}>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmSoHuuTriTuePage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmSoHuuTriTueAll();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmSoHuuTriTue(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa sở hữu trí tuệ', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmSoHuuTriTue(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmSoHuuTriTue:write'),
            permissionDelete = currentPermissions.includes('dmSoHuuTriTue:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmSoHuuTriTue && this.props.dmSoHuuTriTue.items ? this.props.dmSoHuuTriTue.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.ma < b.ma ? -1 : 1);
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
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
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.ma}</a></td>
                                <td>{item.ten}</td>
                                <td>{item.ghiChu}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' data-toggle='tooltip' title='Chỉnh sửa' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' data-toggle='tooltip' title='Xóa' href='#' onClick={e => this.delete(e, item)}>
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
                    <h1><i className='fa fa-list-alt' /> Danh mục Sở hữu trí tuệ</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Sở hữu trí tuệ
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmSoHuuTriTue={this.props.dmSoHuuTriTue}
                    create={this.props.createDmSoHuuTriTue} update={this.props.updateDmSoHuuTriTue} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' data-toggle='tooltip' title='Tạo' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmSoHuuTriTue: state.dmSoHuuTriTue });
const mapActionsToProps = { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue };
export default connect(mapStateToProps, mapActionsToProps)(DmSoHuuTriTuePage);