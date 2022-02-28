import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtBangPhatMinhUserPage, deleteQtBangPhatMinhUserPage, createQtBangPhatMinhUserPage,
    updateQtBangPhatMinhUserPage
} from './redux';

class EditModal extends AdminModal {
    state = {
        id: null,
    };

    onShow = (item) => {
        let { id, tenBang, soHieu, namCap, noiCap, tacGia, sanPham, loaiBang } = item.item ? item.item : {
            id: '', tenBang: '', soHieu: '', namCap: '', noiCap: '', tacGia: '', sanPham: '', loaiBang: ''
        };
        this.setState({
            id, 
            shcc: item.shcc
        }, () => {
            const d = new Date(namCap, 1);
            this.tenBang.value(tenBang ? tenBang : '');
            this.soHieu.value(soHieu ? soHieu : '');
            this.namCap.value(d ? d.getTime() : '');
            this.noiCap.value(noiCap ? noiCap : '');
            this.tacGia.value(tacGia ? tacGia : '');
            this.sanPham.value(sanPham ? sanPham : '');
            this.loaiBang.value(loaiBang ? loaiBang : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            tenBang: this.tenBang.value(),
            soHieu: this.soHieu.value(),
            namCap: this.namCap.value().getYear() + 1900,
            noiCap: this.noiCap.value(),
            tacGia: this.tacGia.value(),
            sanPham: this.sanPham.value(),
            loaiBang: this.loaiBang.value(),
        };
        if (!this.tenBang.value()) {
            T.notify('Tên bằng phát minh trống', 'danger');
            this.tenBang.focus();
        } else if (!this.soHieu.value()) {
            T.notify('Số hiệu bằng phát minh trống', 'danger');
            this.soHieu.focus();
        } else if (!this.namCap.value()) {
            T.notify('Năm cấp bằng phát minh trống', 'danger');
            this.namCap.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }
    
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình bằng phát minh' : 'Tạo mới quá trình bằng phát minh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.tenBang = e} label='Tên bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.soHieu = e} label='Số hiệu bằng phát minh' readOnly={readOnly}/>
                <FormDatePicker className='col-md-6' type='year-mask' ref={e => this.namCap = e} label='Năm cấp bằng phát minh' placeholder='Năm cấp' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.noiCap = e} label='Nơi cấp bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.tacGia = e} label='Tác giả bằng phát minh' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.sanPham = e} label='Sản phẩm' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.loaiBang = e} label='Loại bằng phát minh' readOnly={readOnly}/>
            </div>
        });
    }
}

class QtBangPhatMinhUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc, list_dv: '', fromYear: null, toYear: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBangPhatMinhUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.list_shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin bằng phát minh', 'Bạn có chắc bạn muốn xóa thông tin bằng phát minh này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBangPhatMinhUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin bằng phát minh bị lỗi!', 'danger');
                else T.alert('Xoá thông tin bằng phát minh thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBangPhatMinh && this.props.qtBangPhatMinh.user_page ? this.props.qtBangPhatMinh.user_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên bằng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hiệu</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nơi cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tác giả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Sản phẩm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại bằng phát minh</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(
                            <>
                                {item.tenBang ? item.tenBang : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.soHieu ? item.soHieu : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>{item.namCap}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.noiCap}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.tacGia}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.sanPham}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.loaiBang}
                            </>
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
            icon: 'fa fa fa-fax',
            title: 'Quá trình bằng phát minh',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Bằng phát minh'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtBangPhatMinhUserPage} update={this.props.updateQtBangPhatMinhUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBangPhatMinh: state.khcn.qtBangPhatMinh });
const mapActionsToProps = {
    getQtBangPhatMinhUserPage, deleteQtBangPhatMinhUserPage,
    updateQtBangPhatMinhUserPage, createQtBangPhatMinhUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBangPhatMinhUserPage);