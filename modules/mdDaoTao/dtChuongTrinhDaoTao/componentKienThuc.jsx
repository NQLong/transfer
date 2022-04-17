import { SelectAdapter_DmMonHoc, getDmMonHoc, SelectAdapter_DmMonHocFacultyFilter } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { deleteDtChuongTrinhDaoTao } from './redux';
export class ComponentKienThuc extends AdminPage {
    maKhoa = null;
    rows = {};
    selectedMonHoc = [];
    state = { datas: {} };

    addRow = (idx, item) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
        const id = item ? item.id : -1;
        const editFlag = (permission.write || permission.manage) ? (id > 0 ? false : true) : false;
        const isDeleted = false;
        this.rows[idx] = {
            maMonHoc: null,
            loaiMonHoc: null,
            tongSoTc: null,
            tinChiLyThuyet: null,
            tinChiThucHanh: null,
            soTiet: null,
            phongTn: null,
            hocKyDuKien: null,
        };
        this.setEditState(idx, editFlag, id, isDeleted, () => {
            this.rows[idx].loaiMonHoc.value(item ? item.loaiMonHoc : 0);
            this.rows[idx].tinChiLyThuyet.value(item ? item.tinChiLyThuyet : 0);
            this.rows[idx].tinChiThucHanh.value(item ? item.tinChiThucHanh : 0);
            this.rows[idx].hocKyDuKien.value(item ? item.hocKyDuKien : null);
            if (item) {
                this.selectedMonHoc.push(item.maMonHoc);
                SelectAdapter_DmMonHoc.fetchOneItem(item.maMonHoc, ({ item }) => {
                    const { tongTinChi, tongTiet, tinChiLt, tinChiTh } = item;
                    this.rows[idx].tongSoTc.value(tongTinChi);
                    this.rows[idx].tinChiLyThuyet.value(tinChiLt.toString());
                    this.rows[idx].tinChiThucHanh.value(tinChiTh.toString());
                    this.rows[idx].soTiet.value(tongTiet);
                });
                this.rows[idx].maMonHoc.value(item.maMonHoc);
            }
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
        // else if (!this.rows[idx].hocKyDuKien.value()) {
        //     T.notify('Vui lòng nhập học kỳ dự kiến', 'danger');
        //     return;
        // }
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
        this.selectedMonHoc.push(id);
        SelectAdapter_DmMonHoc.fetchOneItem(id, ({ item }) => {
            const { tongTinChi, tongTiet, tinChiLt, tinChiTh } = item;
            this.rows[idx].tongSoTc.value(tongTinChi);
            this.rows[idx].tinChiLyThuyet.value(tinChiLt);
            this.rows[idx].tinChiThucHanh.value(tinChiTh || 0);
            this.rows[idx].soTiet.value(tongTiet);
            this.addRow(idx + 1);
        });

    }

    selectMh = (idx) => {
        return (
            <FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocFacultyFilter(this.props.khoiKienThucId === 1 ? [33, this.maKhoa] : this.maKhoa, this.selectedMonHoc)} style={{ marginBottom: 0, width: '350px' }} placeholder='Chọn môn học' readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(idx, value.id)} />
        );
    };
    insertLoaiMh = (idx) => {
        return <FormCheckbox ref={e => this.rows[idx].loaiMonHoc = e} readOnly={this.state.datas[idx].isDeleted} />;
    };
    insertTongSoTc = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].tongSoTc = e} readOnly={true} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertTinChiLt = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].tinChiLyThuyet = e} readOnly={true} max={999} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertTinChiTh = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].tinChiThucHanh = e} readOnly={true} style={{ marginBottom: 0, width: '50px' }} />);
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
        try {
            const keys = Object.keys(this.rows);
            const updateDatas = [];
            const deleteDatas = [];
            keys.forEach((key) => {
                const id = this.state.datas[key].id;
                const item = {
                    id: id,
                    maMonHoc: this.rows[key].maMonHoc?.value(),
                    loaiMonHoc: Number(this.rows[key].loaiMonHoc?.value()),
                    maKhoiKienThuc: this.props.khoiKienThucId,
                    tinChiLyThuyet: this.rows[key].tinChiLyThuyet?.value(),
                    tinChiThucHanh: this.rows[key].tinChiThucHanh?.value(),
                    hocKyDuKien: this.rows[key].hocKyDuKien?.value(),
                };
                if (item.maMonHoc) {
                    if (id > 0 && this.state.datas[key].isDeleted) {
                        deleteDatas.push(item);
                    } else if (!this.state.datas[key].isDeleted) {
                        updateDatas.push(item);
                    }
                }
            });
            return { updateDatas, deleteDatas };
        } catch (e) {
            return false;
        }
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
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ
                        </th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Số tiết</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
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
                        <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTinChiLt(index)} />
                        <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTinChiTh(index)} />
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