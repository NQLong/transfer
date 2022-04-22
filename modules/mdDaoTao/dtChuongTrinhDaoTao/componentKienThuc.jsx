import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmMonHoc, getDmMonHoc, SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { deleteDtChuongTrinhDaoTao } from './redux';
export class ComponentKienThuc extends AdminPage {
    maKhoa = null;
    rows = {};
    state = { datas: {} };

    addRow = (idx, item) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
        const id = item ? item.id : -1;
        const editFlag = (permission.write || permission.manage) ? (id > 0 ? false : true) : false;
        const isDeleted = false;
        this.rows[idx] = {
            maMonHoc: null,
            loaiMonHoc: null,
            soTinChi: null,
            soTietLyThuyet: null,
            soTietThucHanh: null,
            soTiet: null,
            hocKyDuKien: null,
            khoa: null
        };
        this.setEditState(idx, editFlag, id, isDeleted, () => {
            this.rows[idx].loaiMonHoc.value(item ? item.loaiMonHoc : 0);
            this.rows[idx].soTietLyThuyet.value(item ? item.soTietLyThuyet.toString() : '0');
            this.rows[idx].soTietThucHanh.value(item ? item.soTietThucHanh.toString() : '0');
            this.rows[idx].hocKyDuKien.value(item ? item.hocKyDuKien : null);
            this.rows[idx].soTinChi.value(item ? item.soTinChi.toString() : '0');
            this.rows[idx].maMonHoc.value(item ? item.maMonHoc : '');
            this.rows[idx].khoa.value(item ? item.khoa : '');
            this.rows[idx].soTiet.value(item ? item.tongSoTiet.toString() : '0');
        });
    }

    setEditState = (idx, editFlag, id, isDeleted, done) => {
        this.setState({
            datas: {
                ...this.state.datas,
                [idx]: {
                    edit: editFlag,
                    id: id,
                    isDeleted: isDeleted,
                }
            }
        }, () => {
            done && done();
        });
    }

    editRow = (e, idx) => {
        e?.preventDefault();
        if (!this.rows[idx] || !this.rows[idx].maMonHoc.value()) {
            T.notify('Vui lòng chọn môn học!', 'danger');
            return;
        }
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
        if (permission.write || permission.manage) {
            const curEdit = this.state.datas[idx].edit;
            const id = this.state.datas[idx].id;
            const isDeleted = this.state.datas[idx].isDeleted;
            this.setEditState(idx, !curEdit, id, isDeleted, () => {
                this.rows[idx].maMonHoc.value(this.rows[idx].maMonHoc.value());
                this.rows[idx].loaiMonHoc.value(this.rows[idx].loaiMonHoc.value());
            });
        }
    }

    removeRow = (e, idx) => {
        e.preventDefault();
        const id = this.state.datas[idx].id;
        T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Xóa môn học thành công!', 'success', false, 800);
                this.setEditState(idx, false, id, true);
            }
        });
    }

    undoRow = (e, idx) => {
        e.preventDefault();
        const id = this.state.datas[idx].id;
        this.setEditState(idx, false, id, false);
    }


    setMonHoc = (idx, id) => {
        if (this.rows[idx - 1] && this.state.datas[idx - 1]?.edit) {
            this.editRow(null, idx - 1);
        }
        SelectAdapter_DmMonHoc.fetchOneItem(id, ({ item }) => {
            const { tongTinChi, tongTiet, tietLt, tietTh, khoa } = item;
            this.rows[idx].soTinChi.value(tongTinChi);
            this.rows[idx].soTietLyThuyet.value(tietLt.toString() || '0');
            this.rows[idx].soTietThucHanh.value(tietTh.toString() || '0');
            this.rows[idx].soTiet.value(tongTiet);
            this.rows[idx].khoa.value(khoa.ma);
            this.addRow(idx + 1);
        });

    }

    selectMh = (idx) => {
        return (
            <>
                <FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocAll} style={{ marginBottom: 0, width: '350px' }} placeholder='Chọn môn học' readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(idx, value.id)} />
                <FormSelect ref={e => this.rows[idx].khoa = e} data={SelectAdapter_DmDonViFaculty_V2} style={{ marginBottom: 0, width: '350px', marginTop: 10 }} readOnly readOnlyNormal />
            </>
        );
    };
    insertLoaiMh = (idx) => {
        return <FormCheckbox ref={e => this.rows[idx].loaiMonHoc = e} readOnly={this.state.datas[idx].isDeleted} />;
    };
    insertTongSoTc = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTinChi = e} readOnly={true} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertTietLt = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTietLyThuyet = e} readOnly={true} max={999} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertTietTh = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTietThucHanh = e} readOnly={true} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertSoTiet = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].soTiet = e} className='col-12' readOnly={true} style={{ marginBottom: 0 }} />);
    };
    insertHocKyDuKien = (idx) => {
        return (<FormTextBox type='number' ref={e => this.rows[idx].hocKyDuKien = e} placeholder='HK' readOnly={this.state.datas[idx].isDeleted} style={{ marginBottom: 0, width: '70px' }} prefix='HK' />);
    };

    convertObjToArr = () => {
        const keys = Object.keys(this.state.datas);
        const tmp = [];
        keys.forEach(key => {
            tmp.push(this.state.datas[key]);
        });
        return tmp;
    }

    getValue = () => {
        const keys = Object.keys(this.rows);
        const updateDatas = [];
        const deleteDatas = [];
        keys.forEach((key, index, array) => {
            const id = this.state.datas[key].id;
            const item = {
                id: id,
                maMonHoc: this.rows[key].maMonHoc?.value(),
                tenMonHoc: this.rows[key].maMonHoc?.data()?.text,
                loaiMonHoc: Number(this.rows[key].loaiMonHoc?.value()),
                maKhoiKienThuc: this.props.khoiKienThucId,
                soTinChi: Number(this.rows[key].soTinChi?.value()),
                soTietLyThuyet: Number(this.rows[key].soTietLyThuyet?.value()),
                soTietThucHanh: Number(this.rows[key].soTietThucHanh?.value()),
                tongSoTiet: this.rows[key].soTiet?.value(),
                hocKyDuKien: this.rows[key].hocKyDuKien?.value(),
                tenKhoa: this.rows[key].khoa?.data()?.text,
                khoa: this.rows[key].khoa?.value(),
            };
            if (item.maMonHoc) {
                if (id > 0 && this.state.datas[key].isDeleted) {
                    deleteDatas.push(item);
                } else if (!this.state.datas[key].isDeleted) {
                    updateDatas.push(item);
                }
            }

            if (index == array.length - 1) return ({ updateDatas, deleteDatas });
        });
        return ({ updateDatas, deleteDatas });
    }

    setVal = (items = [], maKhoa) => {
        this.maKhoa = maKhoa;
        let length = 0;
        items.forEach((item) => {
            if (item.maKhoiKienThuc.toString() === this.props.khoiKienThucId.toString()) {
                this.addRow(length, item);
                length++;
            }
        });
        this.addRow(length);
    }


    render() {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['read', 'manage', 'write', 'delete']);
        const title = this.props.title;

        let styleRow = (idx) => ({ backgroundColor: `${this.state.datas[idx]?.isDeleted ? '#ffdad9' : (!this.state.datas[idx]?.edit ? '#C8F7C8' : null)}` });
        let count = 1;
        const table = renderTable({
            getDataSource: () => this.convertObjToArr(),
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>STT</th>
                        <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tự chọn</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Học kỳ<br />(dự kiến)</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ
                        </th>
                        <th rowSpan='1' colSpan='3' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Số tiết</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                    </tr>

                </>),
            renderRow: (item, index) => {
                let stt = (!this.state.datas[index]?.edit && !this.state.datas[index]?.isDeleted) ? count++ : null;
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={stt} />
                        <TableCell content={this.selectMh(index)} style={{ backgroundColor: styleRow(index).backgroundColor }} />
                        <TableCell content={this.insertLoaiMh(index)} style={{ backgroundColor: styleRow(index).backgroundColor, textAlign: 'center' }} />
                        <TableCell type='number' content={this.insertHocKyDuKien(index)} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} />
                        <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTongSoTc(index)} />
                        <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTietLt(index)} />
                        <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTietTh(index)} />
                        <TableCell type='number' content={this.insertSoTiet(index)} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} />
                        <td rowSpan={1} colSpan={1} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }}>
                            <div className='btn-group'>
                                {
                                    (permission.write || permission.manage) && !item.isDeleted ?
                                        <>
                                            <a className='btn btn-primary' href='#' title={!item.edit ? 'Chỉnh sửa' : 'Xong'} onClick={(e) => this.editRow(e, index)}><i className={'fa fa-lg ' + (!item.edit ? 'fa-edit' : 'fa-check')} /></a>
                                            {!item.edit && <a className='btn btn-danger' href='#' title='Xóa' onClick={(e) => this.removeRow(e, index)}><i className='fa fa-lg fa-trash' /></a>}
                                        </>
                                        : !item.edit && <a className='btn btn-danger' href='#' title='Xóa' onClick={(e) => this.undoRow(e, index)}><i className='fa fa-lg fa-undo' /></a>
                                }
                            </div>
                        </td>
                    </tr>
                );
            },
        });

        return (<>
            <div className='tile'>
                <div>
                    <h4>{title}</h4>
                    <p>{this.props.subTitle}</p>
                </div>
                {table}
            </div>
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDmMonHoc, deleteDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKienThuc);