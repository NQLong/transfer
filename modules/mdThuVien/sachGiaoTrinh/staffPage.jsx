import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateSachGiaoTrinhUserPage, deleteSachGiaoTrinhUserPage,
    getSachGiaoTrinhUserPage, createSachGiaoTrinhUserPage,
} from './redux';

import { DateInput } from 'view/component/Input';

const quocTeList = [
    { id: 0, text: 'Xuât bản trong nước' },
    { id: 1, text: 'Xuất bản quốc tế' },
    { id: 2, text: 'Xuất bản trong và ngoài nước' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
    }

    onShow = (item) => {
        let { id, ten, theLoai, nhaSanXuat, namSanXuat, chuBien, sanPham, butDanh, quocTe } = item && item.item ? item.item : {
            id: null, ten: '', theLoai: '', nhaSanXuat: '', namSanXuat: null, chuBien: '', sanPham: '', butDanh: '', quocTe: 0
        };
        this.setState({
            id, item,
            shcc: item.shcc
        });
        setTimeout(() => {
            this.ten.value(ten);
            this.theLoai.value(theLoai ? theLoai : '');
            if (namSanXuat) this.namSanXuat.setVal(new Date(namSanXuat.toString()));
            this.nhaSanXuat.value(nhaSanXuat ? nhaSanXuat : '');
            this.chuBien.value(chuBien ? chuBien : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.butDanh.value(butDanh ? butDanh : '');
            this.quocTe.value(quocTe);
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            ten: this.ten.value(),
            theLoai: this.theLoai.value(),
            namSanXuat: this.namSanXuat.getVal() ? new Date(this.namSanXuat.getVal()).getFullYear() : null,
            nhaSanXuat: this.nhaSanXuat.value(),
            chuBien: this.chuBien.value(),
            sanPham: this.sanPham.value(),
            butDanh: this.butDanh.value(),
            quocTe: this.quocTe.value()
        };
        if (!this.ten.value()) {
            T.notify('Tên sách, giáo trình trống', 'danger');
            this.ten.focus();
        } else if (!this.namSanXuat.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namSanXuat.focus();
        } else if (!this.nhaSanXuat.value()) {
            T.notify('Nhà xuất bản trống', 'danger');
            this.nhaSanXuat.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật sách giáo trình' : 'Tạo mới sách giáo trình',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox className='col-12' ref={e => this.ten = e} label={'Tên sách, giáo trình'} type='text' readOnly={readOnly} required />
                <div className='form-group col-md-4'><DateInput ref={e => this.namSanXuat = e} label='Năm xuất bản' type='year' readOnly={readOnly} required /></div>
                <FormTextBox className='col-8' ref={e => this.nhaSanXuat = e} label={'Nhà xuất bản, số hiệu ISBN'} type='text' readOnly={readOnly} required />
                <FormTextBox className='col-4' ref={e => this.theLoai = e} label={'Thể loại'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chuBien = e} label={'Chủ biên, đồng chủ biên'} type='text' readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.butDanh = e} label={'Bút danh'} type='text' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} readOnly={readOnly} />
            </div>,
        });
    }
}

class SachGiaoTrinhUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getSachGiaoTrinhUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin sách giáo trình', 'Bạn có chắc bạn muốn xóa thông tin sách giáo trình này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSachGiaoTrinhUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin sách giáo trình bị lỗi!', 'danger');
                else T.alert('Xoá thông tin sách giáo trình thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sachGiaoTrinh && this.props.sachGiaoTrinh.userPage ? this.props.sachGiaoTrinh.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin sách</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thông tin sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nơi xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span>Tên: <i>{item.ten}</i></span><br /> <br />
                                {item.theLoai ? <span><b>Thể loại: </b><span style={{ whiteSpace: 'nowrap' }}>{item.theLoai}<br /></span></span> : null}
                                {item.butDanh ? <span><b>Bút danh: </b><i>{item.butDanh}</i></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Nhà xuất bản: <i>{item.nhaSanXuat}</i></span><br />
                                <span>Năm xuất bản: <span style={{ color: 'blue' }}>{item.namSanXuat}</span></span> <br /> <br />
                                <span>Chủ biên: <span style={{ color: 'blue' }}>{item.chuBien}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(<span>{item.sanPham}</span>)} />
                        <TableCell type='text' content={(
                            item.quocTe == '0' ? <span> Xuất bản trong nước</span>
                                : item.quocTe == '1' ? <span> Xuất bản quốc tế</span>
                                    : item.quocTe == '2' ? <span> Xuất bản trong và ngoài nước </span>
                                        : ''
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>

                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Sách giáo trình',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Sách giáo trình'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    update={this.props.updateSachGiaoTrinhUserPage} create={this.props.createSachGiaoTrinhUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sachGiaoTrinh: state.library.sachGiaoTrinh });
const mapActionsToProps = {
    updateSachGiaoTrinhUserPage, deleteSachGiaoTrinhUserPage,
    getSachGiaoTrinhUserPage, createSachGiaoTrinhUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(SachGiaoTrinhUserPage);