import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtBaiVietKhoaHocPage, updateQtBaiVietKhoaHocGroupPageMa,
    deleteQtBaiVietKhoaHocGroupPageMa, getQtBaiVietKhoaHocGroupPageMa, 
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const quocTeList = [
    { id: 0, text: 'Xuât bản trong nước' },
    { id: 1, text: 'Xuất bản quốc tế' },
];

class EditModal extends AdminModal {
    state = {
        id: '',
    };
    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;

        let { id, shcc, tenTacGia, namXuatBan, tenBaiViet, tenTapChi, soHieuIssn, sanPham, diemIf, quocTe } = item ? item : {
            id: null, shcc: '', tenTacGia: '', namXuatBan: null, tenBaiViet: '', tenTapChi: '', soHieuIssn: '', sanPham: '', diemIf: '',
            quocTe: 0
        };

        this.setState({ id: id });

        setTimeout(() => {
            this.maCanBo.value(shcc);
            this.tenTacGia.value(tenTacGia ? tenTacGia : '');
            if (namXuatBan) this.namXuatBan.setVal(new Date(namXuatBan.toString()));
            this.tenBaiViet.value(tenBaiViet ? tenBaiViet : '');
            this.tenTapChi.value(tenTapChi ? tenTapChi : '');
            this.soHieuIssn.value(soHieuIssn ? soHieuIssn : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.diemIf.value(diemIf ? diemIf : '');
            this.quocTe.value(quocTe ? quocTe : 0);
        }, 500);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenTacGia.value()) {
            T.notify('Tên tác giả trống', 'danger');
            this.tenTacGia.focus();
        } else if (!this.tenTapChi.value()) {
            T.notify('Tên tạp chí trống', 'danger');
            this.tenTapChi.focus();
        } else if (!this.soHieuIssn.value()) {
            T.notify('Số hiệu ISSN trống', 'danger');
            this.soHieuIssn.focus();
        } else if (!this.namXuatBan.getVal()) {
            T.notify('Năm xuất bản trống', 'danger');
            this.namXuatBan.focus();
        } else {
            list_ma.forEach((ma) => {
                const changes = {
                    shcc: ma,
                    tenTacGia: this.tenTacGia.value(),
                    namXuatBan: this.namXuatBan.getVal() ? new Date(this.namXuatBan.getVal()).getFullYear() : null,
                    tenBaiViet: this.tenBaiViet.value(),
                    tenTapChi: this.tenTapChi.value(),
                    soHieuIssn: this.soHieuIssn.value(),
                    sanPham: this.sanPham.value(),
                    diemIf: this.diemIf.value(),
                    quocTe: this.quocTe.value(),
                };
                this.props.update(this.state.id, changes, this.hide);
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật bài viết khoa học' : 'Tạo mới bài viết khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-12' ref={e => this.tenTacGia = e} label={'Tác giả'} type='text' required />
                <FormRichTextBox className='col-12' ref={e => this.tenBaiViet = e} label={'Tên bài viết'} type='text'/>
                <FormTextBox className='col-9' ref={e => this.tenTapChi = e} label={'Tên tạp chí'} type='text' required />
                <FormTextBox className='col-3' ref={e => this.soHieuIssn = e} label={'Số hiệu ISSN'} type='text' required/>
                <FormRichTextBox className='col-12' ref={e => this.sanPham = e} label={'Sản phẩm'} type='text'/>
                <div className='form-group col-md-4'><DateInput ref={e => this.namXuatBan = e} label='Năm xuất bản' type='year' required /></div>
                <FormSelect className='col-md-4' ref={e => this.quocTe = e} label='Phạm vi xuất bản' data={quocTeList} />
                <FormTextBox className='col-4' ref={e => this.diemIf = e} label={'Điểm If'} type='text'/>
            </div>
        });
    }
}

class QtBaiVietKhoaHocGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/bai-viet-khoa-hoc/group_bvkh/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtBaiVietKhoaHocPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtBaiVietKhoaHocGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa bài viết khoa học', 'Bạn có chắc bạn muốn xóa bài viết khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaiVietKhoaHocGroupPageMa(item.id, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá bài viết khoa học bị lỗi!', 'danger');
                else T.alert('Xoá bài viết khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtBaiVietKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBaiVietKhoaHoc && this.props.qtBaiVietKhoaHoc.page ? this.props.qtBaiVietKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Bài viết</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tạp chí xuất bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm If</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phạm vi xuất bản</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tenBaiViet}</span> <br/>
                                <span>Tác giả:
                                    <a href='#' onClick={() => this.modal.show(item, false)}>
                                        <span style={{color: 'blue'}}>{' ' + item.tenTacGia} </span>
                                    </a>
                                </span>

                            </>
                            
                        )} />
                        <TableCell type='text' content={(
                            <>
                                <span>Tên: <span>{item.tenTapChi}</span> </span> <br/>
                                <span style={{ whiteSpace: 'nowrap' }}>Số hiệu ISSN: <span style={{ color: 'blue' }}>{item.soHieuIssn}</span> </span> <br/>
                                <span style={{ whiteSpace: 'nowrap' }}>Năm xuất bản: <span style={{ color: 'blue' }}>{item.namXuatBan}</span> </span>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemIf} />
                        <TableCell type='text' content={(
                            item.quocTe == '0' ? <span> Xuất bản trong nước</span>
                            : item.quocTe == '1' ? <span> Xuất bản quốc tế</span>
                                : ''
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                        </TableCell>
                        
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-quote-right',
            title: 'Bài viết khoa học',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Bài viết khoa học'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtBaiVietKhoaHocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    update={this.props.updateQtBaiVietKhoaHocGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/bai-viet-khoa-hoc',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaiVietKhoaHoc: state.qtBaiVietKhoaHoc });
const mapActionsToProps = {
    getQtBaiVietKhoaHocPage, deleteQtBaiVietKhoaHocGroupPageMa,
    updateQtBaiVietKhoaHocGroupPageMa, getQtBaiVietKhoaHocGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaiVietKhoaHocGroupPage);