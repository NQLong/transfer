import React from 'react';
import { connect } from 'react-redux';
import { getTccbKhungDanhGiaDonViAll } from '../tccbDanhGiaNam/reduxKhungDanhGiaDonVi';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getTccbDanhGiaNamAll } from '../tccbDanhGiaNam/redux';
import { getTccbDonViDangKyNhiemVuAll, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu } from './redux';
import { AdminPage, renderTable, TableCell, AdminModal, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import T from 'view/js/common';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.dangKyKpi.focus()
        ));
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
        if (changes.dangKyKpi == '') {
            T.notify('Nội dung đăng ký bị trống', 'danger');
            this.dangKyKpi.focus();
        } else {
            if (this.state.item.id) {
                this.props.update(this.state.item.id, changes, () => this.hide());
            } else {
                this.props.create({
                    ...changes,
                    maKhungDanhGiaDonVi: this.state.item.maKhungDanhGiaDonVi,
                    maDonVi: this.state.item.maDonVi,
                    nam: Number(this.state.item.nam),
                }, () => this.hide());
            }
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
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/don-vi-dang-ky-nhiem-vu/:nam');
            this.nam = Number(route.parse(window.location.pathname)?.nam);
            this.maDonVi = this.props.system.user.maDonVi;
            this.props.getDmDonVi(this.maDonVi, item => {
                this.donVi = item?.ten;
                this.load(this.nam, this.maDonVi);
            });
        });
    }

    load = (nam, maDonVi, done) => {
        this.props.getTccbDanhGiaNamAll({ nam: Number(nam) }, danhGiaNam => {
            danhGiaNam = danhGiaNam[0];
            this.props.getTccbKhungDanhGiaDonViAll({ nam: Number(nam) }, danhGiaDonVis => {
                this.props.getTccbDonViDangKyNhiemVuAll({ nam: Number(this.nam), maDonVi }, dangKys => {
                    let items = danhGiaDonVis.filter(item => !item.parentId);
                    items = items.map(item => danhGiaDonVis.filter(danhGia => danhGia.parentId == item.id));
                    items = items.reduce((prev, cur) => prev.concat(cur));
                    items = items.map(danhGiaDonVi => {
                        const index = dangKys.findIndex(dangKy => dangKy.maKhungDanhGiaDonVi == danhGiaDonVi.id);
                        if (index == -1) {
                            return {
                                noiDung: danhGiaDonVi.noiDung,
                                maKhungDanhGiaDonVi: danhGiaDonVi.id,
                                maDonVi,
                                nam: Number(this.nam),
                            };
                        }
                        return {
                            noiDung: danhGiaDonVi.noiDung,
                            ...dangKys[index]
                        };
                    });
                    this.setState({ items, danhGiaNam });
                    done && done();
                });
            });
        });
    }

    create = (item, done) => this.props.createTccbDonViDangKyNhiemVu(item, () => this.load(this.nam, this.maDonVi, done));

    update = (id, changes, done) => this.props.updateTccbDonViDangKyNhiemVu(id, changes, () => this.load(this.nam, this.maDonVi, done));

    delete = (e, item) => {
        e.preventDefault();
        if (item.id) {
            T.confirm('Xóa đăng ký', 'Bạn có chắc bạn muốn xóa đăng ký này?', true, isConfirm =>
                isConfirm && this.props.deleteTccbDonViDangKyNhiemVu(item.id, () => this.load(this.nam, this.maDonVi)));
        } else {
            T.notify('Bạn chưa đăng ký KPI ở mục này', 'danger');
        }
    }

    render() {
        const permission = this.getUserPermission('tccbDonViDangKyNhiemVu');
        const list = this.state?.items || [];
        const danhGiaNam = this.state?.danhGiaNam || null;
        console.log(list);
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
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'left' }} content={item.noiDung} />
                    <TableCell style={{ textAlign: 'left' }} content={<p dangerouslySetInnerHTML={{ __html: item.dangKyKpi }} />} />
                    <TableCell style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }} content={item.dienGiai} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onDelete={(e) => danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy) ? this.delete(e, item) : T.notify('Hết thời hạn đăng ký', 'danger')}
                    >
                        {
                            permission.write && danhGiaNam && (danhGiaNam.donViBatDauDangKy <= new Date().getTime() && new Date().getTime() <= danhGiaNam.donViKetThucDangKy)
                            && <Tooltip title='Đăng ký' arrow>
                                <a className='btn btn-info' href='#' onClick={() => this.modal.show(item)}>
                                    <i className='fa fa-lg fa-edit' />
                                </a>
                            </Tooltip>
                        }
                    </TableCell>
                </tr>
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
const mapActionsToProps = { getTccbKhungDanhGiaDonViAll, getTccbDonViDangKyNhiemVuAll, createTccbDonViDangKyNhiemVu, updateTccbDonViDangKyNhiemVu, deleteTccbDonViDangKyNhiemVu, getDmDonVi, getTccbDanhGiaNamAll };
export default connect(mapStateToProps, mapActionsToProps)(TccbDonViDangKyNhiemVuDetails);