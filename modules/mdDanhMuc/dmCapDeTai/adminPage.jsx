import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getDmCapDeTaiAll, deleteDmCapDeTai, createDmCapDeTai, updateDmCapDeTai } from './redux';
import { DateInput2 } from 'view/component/Input';

class EditModal extends React.Component {
    modalID = 'DmCapDeTaiModal_' + T.randomPassword();
    modal = React.createRef();
    dkdtNgayBdRef = React.createRef();
    dkdtNgayKtRef = React.createRef();
    pbdtNgayBdRef = React.createRef();
    pbdtNgayKtRef = React.createRef();
    state = { ma: null, status: '' }

    show = (item = {}) => {
        let isUpdate = !$.isEmptyObject(item);
        this.setState({ ma: item.maCap, isUpdate });

        $(this.modal.current).modal('show');
        $(this.modal.current).find('.modal-title').html(isUpdate ? 'Chỉnh sửa thời gian đăng ký - phản biện' : 'Tạo mới thông tin cấp đề tài');

        $('#dmCapDeTaiMaCap').val(item.maCap);
        $('#dmCapDeTaiTenCap').val(item.tenCap);
        $('#dmCapDeTaiStt').val(item.stt);
        this.dkdtNgayBdRef.current.setVal(item.dkdtNgayBd);
        this.dkdtNgayKtRef.current.setVal(item.dkdtNgayKt);
        this.pbdtNgayBdRef.current.setVal(item.pbdtNgayBd);
        this.pbdtNgayKtRef.current.setVal(item.pbdtNgayKt);

        this.focusInput(isUpdate ? $('#dmCapDeTaiTenCap') : $('#dmCapDeTaiMaCap'));
    };

    focusInput = element => element.focus ? element.focus() : $(element).data('select2-hidden-accessible') ? $(element).select2('open') : $(element).focus();

    getValue = (selector, required = true, dataGetter = i => i.val ? i.val() : $(i).val() ? $(i).val().trim() : '') => {
        const data = dataGetter(selector);
        if (data) return data;
        if (required) throw selector;
        return '';
    }

    save = (e) => {
        e.preventDefault();
        try {
            const changes = {
                maCap: this.getValue('#dmCapDeTaiMaCap'),
                tenCap: this.getValue('#dmCapDeTaiTenCap'),
                stt: this.getValue('#dmCapDeTaiStt', false),
                dkdtNgayBd: this.getValue(this.dkdtNgayBdRef.current, false),
                dkdtNgayKt: this.getValue(this.dkdtNgayKtRef.current, false),
                pbdtNgayBd: this.getValue(this.pbdtNgayBdRef.current, false),
                pbdtNgayKt: this.getValue(this.pbdtNgayKtRef.current, false),
            };
            const done = item => {
                if (item) $(this.modal.current).modal('hide');
            };
            if (changes.dkdtNgayBd > changes.dkdtNgayKt) {
                T.notify('Ngày kết thúc đăng kí đề tài không hợp lệ!');
            } else if (changes.pbdtNgayBd > changes.pbdtNgayKt) {
                T.notify('Ngày kết thúc phản biện đề tài không hợp lệ!');
            } else if (this.state.isUpdate) {
                this.props.update(this.state.ma, changes, done);
            } else {
                this.props.create(changes, done);
            }
        } catch (e) {
            this.focusInput(e);
            const fieldName = e.label || $('label[for=' + $(e).attr('id') + ']').text();
            T.notify('<b>' + fieldName + '</b> bị trống!!', 'danger');
        }
    }

    handleOnChange = (e, ref) => {
        if (e.constructor.name == 'Class' && this.state.status != 'SyntheticEvent') {
            let currentDate = new Date();
            ref.current.setVal(currentDate);
            this.setState({ status: e.constructor.name });
        } else {
            this.setState({ status: e.constructor.name });
        }
    }
    render() {
        const readOnly = !!this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục cấp dề tài</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body row' id={this.modalID}>

                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='dmCapDeTaiStt'>Số thứ tự</label>
                                <input className='form-control' id='dmCapDeTaiStt' type='number' placeholder='Số thứ tự' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'></div>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='dmCapDeTaiMaCap'>Mã Cấp</label>
                                <input className='form-control' id='dmCapDeTaiMaCap' type='text' placeholder='Mã cấp' maxLength={2} disabled={readOnly || this.state.isUpdate} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='dmCapDeTaiTenCap'>Tên cấp</label>
                                <input className='form-control' id='dmCapDeTaiTenCap' type='text' placeholder='Tên cấp' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <DateInput2 ref={this.dkdtNgayBdRef} onChange={event => { this.handleOnChange(event, this.dkdtNgayBdRef); }} type='minute' label='Ngày bắt đầu đăng ký' placeholder='Ngày bắt đầu đăng ký' disabled={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <DateInput2 ref={this.dkdtNgayKtRef} onChange={event => { this.handleOnChange(event, this.dkdtNgayKtRef); }} type='minute' label='Ngày kết thúc đăng ký' placeholder='Ngày kết thúc đăng ký' disabled={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <DateInput2 ref={this.pbdtNgayBdRef} onChange={event => { this.handleOnChange(event, this.pbdtNgayBdRef); }} type='minute' label='Ngày bắt đầu phản biện' placeholder='Ngày bắt đầu phản biện' disabled={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <DateInput2 ref={this.pbdtNgayKtRef} onChange={event => { this.handleOnChange(event, this.pbdtNgayKtRef); }} type='minute' label='Ngày kết thúc phản biện' placeholder='Ngày kết thúc phản biện' disabled={readOnly} />
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

class AdminPage extends React.Component {
    modal = React.createRef();
    optionsMaCapCha = [];

    componentDidMount() {
        this.props.getDmCapDeTaiAll();
        T.ready('/user/khcn', () => {
            this.props.getDmCapDeTaiAll(items => {
                if (items) {
                    items.forEach(item => {
                        this.optionsMaCapCha.push(<option key={item.maCap} value={item.maCap}>{item.maCap + ': ' + item.tenCap}</option>);
                    });
                }
            });
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa cấp đề tài', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmCapDeTai(item.maCap));
    }

    toggleDktmdT = item => {
        this.props.updateDmCapDeTai(item.maCap, { dkTmdt: item.dkTmdt === 1 ? 0 : 1 });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmCapDeTai:write'),
            permissionDelete = currentPermissions.includes('dmCapDeTai:delete');
        let table = 'Không có danh sách!',
            items = this.props.dmCapDeTai && this.props.dmCapDeTai.items ? this.props.dmCapDeTai.items : [];
        if (items && items.length > 0) {
            items.sort((a, b) => a.maCap < b.maCap ? -1 : 1);
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên cấp</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mã cấp</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thời gian đăng ký</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thời gian phản biện</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.tenCap}</a></td>
                                <td style={{ textAlign: 'center' }}>{item.maCap ? item.maCap : ''}</td>
                                <td>
                                    {item.dkdtNgayBd ? T.dateToText(item.dkdtNgayBd, 'dd/mm/yyyy HH:MM') : ''} <br />
                                    {item.dkdtNgayKt ? '- ' + T.dateToText(item.dkdtNgayKt, 'dd/mm/yyyy HH:MM') : ''}
                                </td>
                                <td>
                                    {item.pbdtNgayBd ? T.dateToText(item.pbdtNgayBd, 'dd/mm/yyyy HH:MM') : ''} <br />
                                    {item.pbdtNgayKt ? '- ' + T.dateToText(item.pbdtNgayKt, 'dd/mm/yyyy HH:MM') : ''}
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
                    <h1><i className='fa fa-clock-o' /> Quản lý thời gian đăng ký - phản biện</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/khcnda'>KHCN&DA</Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/khcnda/khcn-quan-ly'>Quản lý</Link>
                        &nbsp;/&nbsp;Quản lý thời gian đăng ký - phản biện
                    </ul>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmCapDeTai={this.props.dmCapDeTai}
                    create={this.props.createDmCapDeTai} update={this.props.updateDmCapDeTai} optionsMaCapCha={this.optionsMaCapCha} />
                <Link to='/user/khcnda/khcn-quan-ly' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmCapDeTai: state.dmCapDeTai });
const mapActionsToProps = { getDmCapDeTaiAll, deleteDmCapDeTai, createDmCapDeTai, updateDmCapDeTai };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);