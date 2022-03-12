import React from 'react';
import { connect } from 'react-redux';
import { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong } from './redux';
import { SelectAdapter_DmNgachCdnn } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { NumberInput, Select } from 'view/component/Input';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, FormCheckbox, renderTable } from 'view/component/AdminPage';
// import { Tooltip } from '@material-ui/core';

class EditModal extends AdminModal {
    state = { vuotKhung: false };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.heSo.focus()));
        // this.vuotKhung.value() ? this.heSo.focus() : this.bac.focus()
    }

    onShow = (item) => {
        // const { idNgach, bac, heSo } = item ? item : { idNgach: '', bac: 1, heSo: 0 };
        let idNgach = null, bac = null, heSo = null;
        if (item) {
            if (typeof item == 'object') {
                idNgach = item.idNgach;
                bac = item.bac;
                heSo = item.heSo;
            } else {
                idNgach = item;
            }
        }

        this.idNgach.val(idNgach ? idNgach : null);
        if (idNgach == null) {
            this.idNgach.clear();
        }
        if (bac && heSo) {
            this.bac.setVal(bac);
            this.heSo.setVal(heSo);
        } else {
            this.bac.clear();
            this.heSo.clear();
        }
        this.setState({ item: item });
        this.setState({ vuotKhung: bac === 0 });
        this.vuotKhung.value(this.state.vuotKhung);
    }

    onSubmit = () => {
        const changes = {
            idNgach: Number(this.idNgach.val()),
            bac: this.state.vuotKhung ? 0 : this.bac.val(),
            heSo: this.heSo.val(),
        };

        if (changes.idNgach == '') {
            T.notify('Vui lòng chọn ngạch!', 'danger');
            this.idNgach.focus();
        } else if (this.state.vuotKhung == false && changes.bac == '') {
            T.notify('Bậc lương bị trống!', 'danger');
            this.bac.focus();
        } else if (changes.heSo == '') {
            T.notify('Hệ số lương bị trống!', 'danger');
            this.heSo.focus();
        } else {
            if (this.state.item && this.state.item.idNgach && (changes.bac || this.state.vuotKhung)) {
                this.props.updateDmNgachLuong(this.state.item.idNgach, changes.bac, changes);
            } else {
                this.props.createDmNgachLuong(changes, () => T.notify('Tạo ngạch lương thành công!', 'success'));
            }
            this.hide();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: typeof this.state.item == 'object' ? 'Cập nhật Ngạch lương' : 'Tạo mới Ngạch lương',
            size: 'medium',
            body: (
                <div className='form-group row'>
                    <div className='form-group col-12 col-md-12'>
                        <Select ref={e => this.idNgach = e} adapter={SelectAdapter_DmNgachCdnn} label='Chức danh nghề nghiệp' readOnly={readOnly} required />
                    </div>

                    <FormCheckbox ref={e => this.vuotKhung = e} className='col-12' label='Vượt khung' readOnly={readOnly} isSwitch={true} onChange={() => !readOnly && this.setState({ vuotKhung: !this.state.vuotKhung })} />

                    <div className='form-group col-12 col-md-12' style={{ display: this.state.vuotKhung ? 'none' : 'block' }}>
                        <NumberInput step={1} ref={e => this.bac = e} className='col-12 col-md-12' label='Bậc lương' readOnly={readOnly} required />
                    </div>
                    <div className='form-group col-12 col-md-12'>
                        <NumberInput step={0.01} ref={e => this.heSo = e} className='col-12 col-md-12' label={this.state.vuotKhung ? 'Phần trăm vượt khung (%)' : 'Hệ số lương'} readOnly={readOnly} required min={1.00} max={8.00} />
                    </div>
                </div>
            )
        });
    }
}

class DmNgachLuong extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmNgachLuongAll();
        T.ready('/user/category');
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    delete = (e, idNgach, bac) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngạch lương', 'Bạn có chắc bạn muốn xóa ngạch lương này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNgachLuong(idNgach, bac));
    }

    renderBac = (e, bac) => {
        e.preventDefault();
        return bac == 0 ? 'VK' : bac;
    }
    renderHeSo = (e, bac, heSo) => {
        e.preventDefault();
        return bac == 0 ? `VK ${heSo}%` : heSo.toFixed(2);
    }

    render() {
        const permission = this.getUserPermission('dmNgachLuong', ['write', 'delete']);

        let list = this.props.dmNgachLuong && this.props.dmNgachLuong.items ? this.props.dmNgachLuong.items : [];

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngạch</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Tên ngạch CDNN</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Nhóm ngạch CDNN</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Bậc lương</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hệ số lương</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item) => {
                const rows = [];
                let luongs = item.luongs || [],
                    rowSpan = luongs.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const luong = luongs[i],
                            heSoLuong = luong.bac == 0 ? `VK ${luong.heSo}%` : luong.heSo.toFixed(2),
                            bacLuong = luong.bac == 0 ? 'VK' : luong.bac;
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length}>
                                    <TableCell type='text' content={item.ma} style={{ textAlign: 'center' }} rowSpan={rowSpan} />
                                    <TableCell type='text' content={item.ten} style={{ textAlign: 'center' }} rowSpan={rowSpan} />
                                    <TableCell type='text' content={item.nhom} style={{ textAlign: 'center' }} rowSpan={rowSpan} />
                                    <TableCell type='text' content={bacLuong} />
                                    <TableCell type='text' content={heSoLuong} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }}
                                        onEdit={this.showModal} content={luong} permission={permission}
                                        onDelete={e => this.delete(e, luong.idNgach, luong.bac)}>
                                        {permission.write && (
                                            // <Tooltip title='Tạo mới' arrow>
                                            <a className='btn btn-success' href='#' onClick={e => this.showModal(e, item.id)}>
                                                <i className='fa fa-lg fa-plus' />
                                            </a>
                                            // </Tooltip>
                                        )}
                                    </TableCell>
                                </tr>
                            );
                        } else {
                            rows.push(
                                <tr key={rows.length}>
                                    <TableCell type='text' content={bacLuong} />
                                    <TableCell type='text' content={heSoLuong} />
                                    <TableCell type='buttons' style={{ textAlign: 'center' }}
                                        onEdit={this.showModal} content={luong} permission={permission}
                                        onDelete={e => this.delete(e, luong.idNgach, luong.bac)}>
                                        {permission.write && (
                                            // <Tooltip title='Tạo mới' arrow>
                                            <a className='btn btn-success' href='#' onClick={e => this.showModal(e, item.id)}>
                                                <i className='fa fa-lg fa-plus' />
                                            </a>
                                            // </Tooltip>
                                        )}
                                    </TableCell>
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            }
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Ngạch lương',
            breadcrumb: [
                <Link key={0} to={'/user/category'}>Danh mục</Link>,
                'Ngạch lương'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} createDmNgachLuong={this.props.createDmNgachLuong} updateDmNgachLuong={this.props.updateDmNgachLuong} />
            </>,
            backRoute: '/user/category',
            onCreate: permission.write ? (e) => this.showModal(e, null) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNgachLuong: state.danhMuc.dmNgachLuong });
const mapActionsToProps = { getDmNgachLuongAll, createDmNgachLuong, deleteDmNgachLuong, updateDmNgachLuong };
export default connect(mapStateToProps, mapActionsToProps)(DmNgachLuong);