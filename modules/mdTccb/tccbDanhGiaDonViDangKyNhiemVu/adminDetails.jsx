import React from 'react';
import { connect } from 'react-redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getTccbDonViDangKyNhiemVuByYear, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu, getTccbDonViDangKyNhiemVuDanhGiaNamAll } from './redux';
import { AdminPage, renderTable, TableCell, AdminModal, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import T from 'view/js/common';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown());
    }

    onShow = (item) => {
        this.dangKyKpi.value(item.dangKyKpi || '');
        this.dienGiai.value(item.dienGiai || '');
        this.setState({ item });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            dangKyKpi: this.dangKyKpi.value(),
            dienGiai: this.dienGiai.value(),
        };
        if (this.state.item.id) {
            this.props.update(this.state.item.id, changes, this.hide);
        } else {
            this.props.create({
                ...changes,
                maKhungDanhGiaDonVi: this.state.item.maKhungDanhGiaDonVi,
                maDonVi: this.state.item.maDonVi,
                nam: Number(this.state.item.nam),
            }, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin đăng ký',
            size: 'large',
            isShowSubmit: !readOnly,
            body: <div className='row'>
                <FormEditor className='col-12 col-sm-12' ref={e => this.dangKyKpi = e} label='Đăng ký KPI' height='200px' readOnly={readOnly} />
                <FormRichTextBox type='text' ref={e => this.dienGiai = e} label='Diễn giải' className='col-12' readOnly={readOnly} />
            </div>
        });
    }
}

class TccbDonViDangKyNhiemVuDetails extends AdminPage {

    componentDidMount() {
        T.ready('/user', () => {
            const route = T.routeMatcher('/user/tccb/don-vi-dang-ky-nhiem-vu/:nam');
            this.nam = Number(route.parse(window.location.pathname)?.nam);
            this.maDonVi = this.props.system.user.maDonVi;
            this.props.getDmDonVi(this.maDonVi, item => {
                this.donVi = item?.ten;
                this.load(this.nam);
            });
        });
    }

    load = (nam, done) => {
        this.props.getTccbDonViDangKyNhiemVuByYear(nam, (data) => {
            this.setState({ items: data.items, danhGiaNam: data.danhGiaNam });
            done && done();
        });
    }

    create = (item, done) => this.props.createTccbDonViDangKyNhiemVu(item, () => this.load(this.nam, done));

    update = (id, changes, done) => this.props.updateTccbDonViDangKyNhiemVu(id, changes, () => this.load(this.nam, done));

    delete = (e, item) => {
        e.preventDefault();
        if (item.id) {
            T.confirm('Xóa đăng ký', 'Bạn có chắc bạn muốn xóa đăng ký này?', true, isConfirm =>
                isConfirm && this.props.deleteTccbDonViDangKyNhiemVu(item.id, () => this.load(this.nam)));
        } else {
            T.notify('Bạn chưa đăng ký KPI ở mục này', 'danger');
        }
    }

    render() {
        const permission = this.getUserPermission('tccbDonViDangKyNhiemVu');
        const list = this.state?.items || [];
        const danhGiaNam = this.state?.danhGiaNam || null;
        let table = renderTable({
            emptyTable: 'Không có dữ liệu đăng ký',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nhiệm vụ</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đăng ký KPI</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Diễn giải</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <>
                    <tr>
                        <TableCell style={{ textAlign: 'center' }} colSpan='1' className='text-primary' content={<b>{(index + 1).intToRoman()}</b>} />
                        <TableCell style={{ textAlign: 'left' }} colSpan='4' className='text-primary' content={<b>{item.noiDung}</b>} />
                    </tr>
                    {
                        item.submenus.length > 0 &&
                        item.submenus.map((menu, stt) => (
                            <tr key={index}>
                                <TableCell style={{ textAlign: 'center' }} content={stt + 1} />
                                <TableCell style={{ textAlign: 'left' }} content={menu.noiDung} />
                                <TableCell style={{ textAlign: 'left' }} content={<p dangerouslySetInnerHTML={{ __html: menu.dangKyKpi }} />} />
                                <TableCell style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={menu.dienGiai} />
                                <TableCell style={{ textAlign: 'center' }} type='buttons' content={menu} permission={permission}
                                    onDelete={(e) => danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy) ? this.delete(e, menu) : T.notify('Hết thời hạn đăng ký', 'danger')}
                                >
                                    {
                                        permission.write && danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy)
                                        && <Tooltip title='Đăng ký' arrow>
                                            <a className='btn btn-info' href='#' onClick={() => this.modal.show(menu)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                        </Tooltip>
                                    }
                                </TableCell>
                            </tr>
                        ))
                    }
                </>

            )
        });

        return this.renderPage({
            icon: 'fa fa-pencil',
            title: `Thông tin đăng ký năm: ${this.nam}, Đơn vị: ${this.donVi || ''}`,
            breadcrumb: [
                <Link key={0} to='/user/tccb/'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/don-vi-dang-ky-nhiem-vu'>Đăng ký nhiệm vụ cho đơn vị</Link>,
                'Thông tin đăng ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.create}
                    update={this.update}
                    readOnly={!permission.write} />
            </>,
            backRoute: '/user/tccb/don-vi-dang-ky-nhiem-vu',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbDonViDangKyNhiemVuByYear, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu, getDmDonVi, getTccbDonViDangKyNhiemVuDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDonViDangKyNhiemVuDetails);