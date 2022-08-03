
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDanhSachMonChuongTrinhDaoTao } from '../dtChuongTrinhDaoTao/redux';
import { createDtDanhSachMonMo } from '../dtDanhSachMonMo/redux';
class MonHocCtdtModal extends AdminModal {
    monChung = {}
    monChuyenNganh = {}
    subChuyenNganh = {}
    state = { listMonHocChonChung: [], listMonHocChonChuyenNganh: [] }
    onShow = (item) => {
        let { khoaSv, thongTinKhoaNganh, maDangKy, nam } = item;
        let { maNganh, khoaDangKy, loaiHinhDaoTao, bacDaoTao } = thongTinKhoaNganh;
        this.setState({ listMonHocChonChung: [], listMonHocChonChuyenNganh: [] });
        this.props.getDanhSachMonChuongTrinhDaoTao({ maNganh, khoaSv, loaiHinhDaoTao, bacDaoTao }, value => {

            this.setState({ listMonHocChung: value.listMonHocChung || [], listMonHocChuyenNganh: value.listMonHocChuyenNganh || [], khoaSv, maNganh, khoaDangKy, maDangKy, loaiHinhDaoTao, bacDaoTao, nam }, () => {
                this.setState({ listMonHocChonChung: this.state.listMonHocChung.filter(item => item.isMo) }, () => {
                    this.state.listMonHocChonChung.forEach(item => {
                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                            this.monChung[textBox][item.maMonHoc].value(item[textBox]);
                        });
                    });
                });

                this.setState({ listMonHocChonChuyenNganh: this.state.listMonHocChuyenNganh.filter(item => item.isMo) }, () => {
                    for (let index = 0; index < this.state.listMonHocChonChuyenNganh.length; index++) {
                        const item = this.state.listMonHocChonChuyenNganh[index];
                        if (item.soLop && !isNaN(item.soLop)) {
                            item.soLop = Number(item.soLop);
                            if (item.soLop == 1 && item.chuyenNganh.length == 1) {
                                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                                    this.monChuyenNganh[textBox][item.maMonHoc].value(item[textBox]);
                                });
                            } else if (item.soLop > 1 && item.chuyenNganh.length > 1) {
                                this.setState({ [`CN_${item.maMonHoc}`]: item.soLop }, () => {
                                    this.monChuyenNganh.soLop[item.maMonHoc].value(item.soLop);
                                    Array.from({ length: Number(item.soLop) }, (_, i) => i).forEach(i => {
                                        ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                                            this.subChuyenNganh[item.maMonHoc][textBox][i + 1].value(item[textBox][i]);
                                        });
                                        this.subChuyenNganh[item.maMonHoc]['chuyenNganh'][i + 1].value(item.currentCn[i]);
                                    });
                                });
                            } else {
                                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh'].forEach(textBox => {
                                    this.monChuyenNganh[textBox][item.maMonHoc].value(item[textBox]);
                                });
                            }
                        }
                    }
                });
            });
        });
    }

    renderMonHocChung = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học',
        header: 'thead-light',
        stickyHead: true,
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết <br /> /buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi <br />/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng <br /> dự kiến</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => {
            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this.monChung[textBox] = {};
            });
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={<>{item.maMonHoc} <br /> {item.tenMonHoc}</>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietLyThuyet} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietThucHanh} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.monChung.soLop[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.monChung.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.monChung.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.monChung.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={!item.isMo} />
                    } />
                    <TableCell type='checkbox' content={item.isMo} permission={{ write: true }} onChanged={(value) => {
                        list[index].isMo = !list[index].isMo;
                        this.setState({ listMonHocChung: list }, () => {
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChung[textBox][item.maMonHoc].value(list[index].isMo ? item[textBox] : ''));
                            let listMonHocChonChung = this.state.listMonHocChonChung;
                            if (value) {
                                listMonHocChonChung.push(item);
                            } else listMonHocChonChung = listMonHocChonChung.filter(monHoc => monHoc.maMonHoc != item.maMonHoc);
                            this.setState({ listMonHocChonChung });
                        });
                    }} />
                </tr>
            );
        }
    })

    renderMonHocChuyenNganh = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học',
        header: 'thead-light',
        // stickyHead: true,
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết <br /> /buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi <br />/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>SLDK</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chuyên ngành</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => {
            ['chuyenNganh', 'soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this.monChuyenNganh[textBox] = {};
            });
            let readOnly = !item.isMo || this.state[`CN_${item.maMonHoc}`];
            return (
                <React.Fragment key={index}>
                    <tr key={0}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell content={<>{item.maMonHoc} <br /> {item.tenMonHoc}</>} />
                        <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                        <TableCell style={{ textAlign: 'right' }} content={item.soTietLyThuyet} />
                        <TableCell style={{ textAlign: 'right' }} content={item.soTietThucHanh} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soLop[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} min={1} max={5} onChange={e => {
                                if (item.chuyenNganh.length > 1) {
                                    item.soLop = e;
                                    if (!isNaN(e) && e > 1) {
                                        this.setState({ [`CN_${item.maMonHoc}`]: e });
                                    } else if (e == 1) {
                                        this.setState({ [`CN_${item.maMonHoc}`]: null });
                                    }
                                }
                            }} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly} min={1} max={5} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={readOnly} min={1} max={3} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.monChuyenNganh.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={readOnly} />
                        } />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={
                            item.chuyenNganh.length > 1 && item.isMo && !this.state[`CN_${item.maMonHoc}`] ?
                                <FormSelect ref={e => this.monChuyenNganh.chuyenNganh[item.maMonHoc] = e} style={{ marginBottom: '0', width: 'auto' }} data={item.chuyenNganh.map((cn, index) => ({ id: cn, text: item.tenChuyenNganh[index] }))} multiple /> : item.tenChuyenNganh.join(', ')
                        } />
                        <TableCell type='checkbox' content={item.isMo} permission={{ write: true }} onChanged={(value) => {
                            item.isMo = !item.isMo;
                            this.setState({ listMonHocChuyenNganh: list }, () => {
                                if (value) {
                                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(item.isMo ? Number(item[textBox]) : ''));

                                    if (item.isMo && (!item.soLop || item.soLop == '')) this.monChuyenNganh.soLop[item.maMonHoc].value(1);
                                    if (item.isMo && item.chuyenNganh.length > 1) this.monChuyenNganh.chuyenNganh[item.maMonHoc].value(item.chuyenNganh);
                                    this.monChuyenNganh.soLop[item.maMonHoc].focus();
                                    this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh, item] });
                                } else {
                                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this.monChuyenNganh[textBox][item.maMonHoc]?.value(''));

                                    if (item.chuyenNganh.length > 1) {
                                        this.setState({ [index]: null }, () => {
                                            this.subChuyenNganh[item.maMonHoc] = null;
                                        });
                                    }
                                    this.setState({ listMonHocChonChuyenNganh: [...this.state.listMonHocChonChuyenNganh].filter(monChon => monChon.maMonHoc != item.maMonHoc) });
                                }

                            });
                        }} />
                    </tr>
                    {Array.from({ length: this.state[`CN_${item.maMonHoc}`] }, (_, i) => i + 1).map(i => {
                        this.subChuyenNganh[item.maMonHoc] = {
                            soLuongDuKien: {},
                            soTietBuoi: {},
                            soBuoiTuan: {},
                            chuyenNganh: {}
                        };
                        const style = { marginBottom: '0', width: 'auto' };
                        return (
                            <tr key={`sub-${i}`} style={{ display: this.state[`CN_${item.maMonHoc}`] ? '' : 'none' }}>
                                <TableCell style={{ textAlign: 'right' }} content={`Lớp ${i}`} colSpan={6} />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soTietBuoi[i] = e} min={1} max={5} style={style} />
                                } />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soBuoiTuan[i] = e} min={1} max={5} style={style} />
                                } />
                                <TableCell content={
                                    <FormTextBox type='number' ref={e => this.subChuyenNganh[item.maMonHoc].soLuongDuKien[i] = e} style={style} />
                                } />
                                <TableCell content={
                                    <FormSelect ref={e => this.subChuyenNganh[item.maMonHoc].chuyenNganh[i] = e} data={item.chuyenNganh.map((cn, index) => ({ id: cn, text: item.tenChuyenNganh[index] }))} multiple style={style} />
                                } colSpan={2} />
                            </tr>
                        );
                    })
                    }
                </React.Fragment>
            );
        }
    })

    getData = () => {
        let { listMonHocChonChung, listMonHocChonChuyenNganh } = this.state;
        try {
            listMonHocChonChung && listMonHocChonChung.length && listMonHocChonChung.forEach(monHoc => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    if (!this.monChung[textBox][monHoc.maMonHoc].value()) {
                        this.monChung[textBox][monHoc.maMonHoc].focus();
                        throw ('Vui lòng nhập đầy đủ thông tin');
                    }
                    else monHoc[textBox] = this.monChung[textBox][monHoc.maMonHoc].value();
                });
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;
            });

            listMonHocChonChuyenNganh && listMonHocChonChuyenNganh.length && listMonHocChonChuyenNganh.forEach(monHoc => {
                if (monHoc.chuyenNganh.length == 1 || (monHoc.chuyenNganh.length > 1 && monHoc.soLop == 1)) {
                    ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                        if (!this.monChuyenNganh[textBox][monHoc.maMonHoc].value()) {
                            this.monChuyenNganh[textBox][monHoc.maMonHoc].focus();
                            throw ('Vui lòng nhập đầy đủ thông tin');
                        }
                        else monHoc[textBox] = this.monChuyenNganh[textBox][monHoc.maMonHoc].value();
                    });
                } else {
                    monHoc.monChuyenNganh = {};
                    ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh'].forEach(textBox => {
                        monHoc.monChuyenNganh[textBox] = {};
                        Array.from({ length: monHoc.soLop }, (_, i) => i + 1).forEach(i => {
                            if (!this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value()) {
                                this.subChuyenNganh[monHoc.maMonHoc][textBox][i].focus();
                                throw ('Vui lòng nhập đầy đủ thông tin');
                            }
                            else {
                                let value = textBox == 'chuyenNganh' ? this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value() : this.subChuyenNganh[monHoc.maMonHoc][textBox][i].value();
                                monHoc.monChuyenNganh[textBox][i] = value;
                            }
                        });
                    });
                }
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;
            });
            return [...listMonHocChonChung, ...listMonHocChonChuyenNganh];
        } catch (error) {
            T.notify(error, 'danger');
            return [];
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        let { loaiHinhDaoTao, bacDaoTao } = this.state;
        let data = this.getData();
        if (data && data.length) {
            this.props.createDtDanhSachMonMo(this.state.maNganh, data, { loaiHinhDaoTao, bacDaoTao, maDangKy: this.state.maDangKy }, this.hide);
        } else {
            T.notify('Chưa chọn môn mở cho khóa!', 'danger');
        }
    }

    render = () => {
        let { listMonHocChung, listMonHocChuyenNganh, khoaSv } = this.state;
        return this.renderModal({
            title: `Chọn môn học từ Chương trình đào tạo khóa ${khoaSv || ''}`,
            size: 'elarge',
            isShowSubmit: listMonHocChung?.length && listMonHocChuyenNganh?.length,
            body: <div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <a className='nav-link active show' data-toggle='tab' href='#monChung'>Chọn các môn cho toàn khóa {khoaSv || ''}</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#monChuyenNganh'>Chọn các môn cho chuyên ngành</a>
                    </li>
                </ul>
                <div className='tab-content'>
                    <div className='tab-pane fade active show' id='monChung'>
                        {this.renderMonHocChung(listMonHocChung)}
                    </div>
                    <div className='tab-pane fade' id='monChuyenNganh'>
                        {this.renderMonHocChuyenNganh(listMonHocChuyenNganh)}
                    </div>
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDanhSachMonChuongTrinhDaoTao, createDtDanhSachMonMo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MonHocCtdtModal);