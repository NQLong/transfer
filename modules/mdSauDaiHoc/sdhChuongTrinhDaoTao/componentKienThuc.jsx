// import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmMonHocSdh, SelectAdapter_DmMonHocSdh } from 'modules/mdSauDaiHoc/dmMonHocSdh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { deleteSdhChuongTrinhDaoTao } from './redux';
// import { getSdhDmKhoiKienThuc } from '../sdhDmKhoiKienThuc/redux';
class ComponentKienThuc extends AdminPage {
    maKhoa = null;
    rows = {};
    state = { datas: {} };
    khoiKienThucMapper = {}
    setVal = (data = [], maKhoa, childs) => {
        // data: Danh sách các môn
        // maKhoa: Mã đơn vị của user hiện tại
        // childs: List các khối kiến thức con
        this.maKhoa = maKhoa;

        if (childs) {
            const length = {};
            //add select monhoc row
            const addSelectRow = () => {
                let cIdx = 0;
                const addEmptySelectRow = (childId, childText) => {
                    if (childId < 0) return;
                    if (!length[childId]) length[childId] = 0;
                    this.addRow(length[childId], null, childId, childText, () => {
                        cIdx++;
                        addEmptySelectRow(childs[cIdx]?.id || -1, childs[cIdx]?.value?.text || '');
                    });
                };
                addEmptySelectRow(childs[cIdx].id, childs[cIdx].value.text);
            };

            const addRow = (item, idx) => {
                if (item && item.maKhoiKienThucCon >= Object.keys(childs).length) {
                    idx++;
                    addRow(data[idx], idx);
                    return;
                }
                if (!item) {
                    addSelectRow();
                    return;
                }
                if (!length[item.maKhoiKienThucCon]) {
                    length[item.maKhoiKienThucCon] = 0;
                }
                this.addRow(length[item.maKhoiKienThucCon], item, item.maKhoiKienThucCon, childs[item.maKhoiKienThucCon]?.value?.text, () => {
                    length[item.maKhoiKienThucCon]++;
                    idx++;
                    addRow(data[idx], idx);
                });
            };
            addRow(data[0], 0);
        } else {
            const addRow = (length, item) => {
                if (!item) {
                    this.addRow(length);
                    return;
                }
                this.addRow(length, item, null, null, () => {
                    length++;
                    addRow(length, data[length]);
                });
            };
            addRow(0, data[0]);
        }

    }
    addRow = (idx, item, childId, childText, done = () => { }) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'sdhChuongTrinhDaoTao', ['write', 'manage']);
        idx = childId !== null && childId >= 0 ? `${childId}_${idx}` : idx;
        const id = item ? item.id : -1;
        const editFlag = (permission.write || permission.manage) ? (id > 0 ? false : true) : false;
        const isDeleted = false;
        this.rows[idx] = {
            maMonHoc: null,
            // tenMonHoc: null,
            loaiMonHoc: null,
            // soTinChi: null,
            tcLyThuyet: null,
            tcThucHanh: null,
            // soTiet: null,
            // hocKyDuKien: null,
            // khoa: null
        };
        this.setEditState(idx, childId, childText, editFlag, id, isDeleted, () => {
            // this.rows[idx].ten = item ? item?.tenMonHoc : '';
            this.rows[idx].loaiMonHoc.value(item ? item.loaiMonHoc : 0);
            this.rows[idx].tcLyThuyet.value(item ? (item.tcLyThuyet || 0).toString() : '0');
            this.rows[idx].tcThucHanh.value(item ? (item.tcThucHanh || 0).toString() : '0');
            // this.rows[idx].hocKyDuKien.value(item ? item.hocKyDuKien : null);
            // this.rows[idx].soTinChi.value(item ? (item.soTinChi || 0).toString() : '0');
            // id != -1 && this.rows[idx]?.tenMonHoc?.value(item && item.tenMonHoc ? item.tenMonHoc : '');
            this.rows[idx].maMonHoc.value(item ? item.maMonHoc : '');
            item && item.maMonHoc && this.props.pushMonHocChosen(item.maMonHoc);
            // this.rows[idx].ma.value((item && item.maMonHoc) ? item.maMonHoc : '');
            // this.rows[idx].khoa.value(item ? item.khoa : '');
            // this.rows[idx].soTiet.value(item ? (item.tongSoTiet || 0).toString() : '0');
            done();
        });
    }

    setEditState = (idx, childId, childText, editFlag, id, isDeleted, done) => {
        this.setState({
            datas: {
                ...this.state.datas,
                [idx]: {
                    idx: idx,
                    childText: childText,
                    childId: childId,
                    edit: editFlag,
                    id: id,
                    isDeleted: isDeleted,
                }
            }
        }, () => {
            done && done();
        });
    }

    editRow = (e, idx, childId) => {
        e?.preventDefault();
        idx = childId >= 0 ? `${childId}_${idx}` : idx;
        if (!this.rows[idx] || !this.rows[idx].maMonHoc.value()) {
            T.notify('Vui lòng chọn môn học!', 'danger');
            return;
        }
        let oldData = this.rows[idx].maMonHoc.value();

        const permission = this.getUserPermission(this.props.prefixPermission || 'sdhChuongTrinhDaoTao', ['write', 'manage']);
        if (permission.write || permission.manage) {
            let curData = this.rows[idx].maMonHoc.value();
            this.props.removeMonHoc(oldData);
            if (this.props.pushMonHocChosen(curData)) {
                const curEdit = this.state.datas[idx].edit;
                const id = this.state.datas[idx].id;
                const isDeleted = this.state.datas[idx].isDeleted;
                const childText = this.state.datas[idx].childText;
                const childId = this.state.datas[idx].childId;
                this.setEditState(idx, childId, childText, !curEdit, id, isDeleted, () => {
                    // this.rows[idx].maMonHoc.value(this.rows[idx].maMonHoc.value());
                    // this.rows[idx].loaiMonHoc.value(this.rows[idx].loaiMonHoc.value());
                });
            } else {
                this.rows[idx].maMonHoc.focus();
            }
        }
    }

    removeRow = (e, idx) => {
        e.preventDefault();
        const id = this.state.datas[idx].id;
        T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Xóa môn học thành công!', 'success', false, 800);
                this.props.removeMonHoc(this.rows[idx].maMonHoc.value());
                const childId = this.state.datas[idx].childId;
                const childText = this.state.datas[idx].childText;
                this.setEditState(idx, childId, childText, false, id, true);
            }
        });
    }

    undoRow = (e, idx, childId) => {
        e.preventDefault();
        idx = childId >= 0 ? `${childId}_${idx}` : idx;
        if (this.props.pushMonHocChosen(this.rows[idx].maMonHoc.value())) {
            const id = this.state.datas[idx].id;
            const childText = this.state.datas[idx].childText;
            this.setEditState(idx, childId, childText, false, id, false);
        }
    }

    setMonHoc = (idx, value, childId, childText) => {
        const id = value.id, { tcLyThuyet, tcThucHanh } = value.item;
        let preIdx, nextIdx;
        if (childId !== null && childId >= 0) {
            const arr = idx.split('_');
            preIdx = parseInt(arr[1]) - 1;
            nextIdx = parseInt(arr[1]) + 1;
        } else {
            preIdx = idx - 1;
            nextIdx = idx + 1;
        }
        const statePreIdx = childId >= 0 ? `${childId}_${preIdx}` : preIdx;
        if (this.rows[statePreIdx] && this.state.datas[statePreIdx]?.edit) {
            this.editRow(null, preIdx, childId);
        }
        if (this.props.pushMonHocChosen(id)) {
            // this.rows[idx].maMonHoc.value(id);
            this.rows[idx].tcLyThuyet.value(tcLyThuyet?.toString() || '0');
            this.rows[idx].tcThucHanh.value(tcThucHanh?.toString() || '0');
            // this.rows[idx].khoa.value(khoa);
            // this.rows[idx].ma.value(id);
            this.addRow(nextIdx, null, childId, childText);
        } else {
            this.rows[idx].maMonHoc.focus();
        }

    }

    selectMh = (item, idx, childId, childText) => {
        return (
            <>
                <FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocSdh()} style={{ marginBottom: 0 }} placeholder='Chọn môn học' readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(idx, value, childId, childText)} />
                {/* <FormSelect ref={e => this.rows[idx].khoa = e} data={SelectAdapter_DmDonViFaculty_V2} style={{ marginBottom: 0, width: '350px', marginTop: 10 }} readOnly readOnlyNormal /> */}
            </>
        );
    };

    insertLoaiMh = (idx) => {
        return <FormCheckbox ref={e => this.rows[idx].loaiMonHoc = e} readOnly={this.state.datas[idx]?.isDeleted} />;
    };

    insertTinChiLt = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].tcLyThuyet = e} readOnly={true} max={999} style={{ marginBottom: 0, width: '50px' }} />);
    };
    insertTinChiTh = (idx) => {
        return (<FormTextBox ref={e => this.rows[idx].tcThucHanh = e} readOnly={true} style={{ marginBottom: 0, width: '50px' }} />);
    };

    convertObjToArr = () => {
        const tmp = Object.values(this.state.datas).sort((a, b) => a.childId - b.childId);
        return tmp;
    }

    getValue = () => {
        const keys = Object.keys(this.rows);
        const updateDatas = [];
        const deleteDatas = [];
        let flag = true;
        keys.forEach((key, index, array) => {
            const id = this.state.datas[key].id;
            const childId = this.state.datas[key].childId;
            const item = {
                id: id,
                maMonHoc: this.rows[key].maMonHoc?.value(),
                loaiMonHoc: Number(this.rows[key].loaiMonHoc?.value()),
                maKhoiKienThuc: this.props.khoiKienThucId,
                tcLyThuyet: Number(this.rows[key].tcLyThuyet?.value()),
                tcThucHanh: Number(this.rows[key].tcThucHanh?.value()),
                // tenKhoa: this.rows[key].khoa?.data()?.text,
                // khoa: this.rows[key].khoa?.value(),
                maKhoiKienThucCon: childId
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
        return flag ? { updateDatas, deleteDatas } : null;
    }

    render() {
        const permission = this.getUserPermission(this.props.prefixPermission || 'sdhChuongTrinhDaoTao', ['read', 'manage', 'write', 'delete']);
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
                        {/* <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Mã môn học</th> */}
                        <th rowSpan='2' style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Môn học</th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tự chọn</th>
                        {/* <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Học kỳ<br />(dự kiến)</th> */}
                        {/* <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ */}
                        {/* </th> */}
                        <th rowSpan='1' colSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tín chỉ</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                    </tr>
                </>),
            renderRow: (item) => {
                const index = item.idx;
                const idx = item.childId !== null && item.childId >= 0 ? index.split('_')[1] : index;
                const stt = (!this.state.datas[index]?.edit && !this.state.datas[index]?.isDeleted) ? count++ : null;
                return (
                    <React.Fragment key={index}>
                        {item.childText && parseInt(idx) == 0 && <tr><td colSpan={10}><b>{item.childText}</b></td></tr>}
                        <tr>
                            <TableCell type='text' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={stt} />
                            {/* <TableCell content={this.selectMaMonHoc(index)} style={{ backgroundColor: styleRow(index).backgroundColor, textAlign: 'center' }} /> */}
                            <TableCell content={this.selectMh(item, index, item.childId, item.childText)} style={{ backgroundColor: styleRow(index).backgroundColor }} />
                            <TableCell content={this.insertLoaiMh(index)} style={{ backgroundColor: styleRow(index).backgroundColor, textAlign: 'center' }} />
                            {/* <TableCell type='number' content={this.insertHocKyDuKien(index)} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} /> */}
                            {/* <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTongSoTc(index)} /> */}
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTinChiLt(index)} />
                            <TableCell type='number' style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} content={this.insertTinChiTh(index)} />
                            {/* <TableCell type='number' content={this.insertSoTiet(index)} style={{ textAlign: 'center', backgroundColor: styleRow(index).backgroundColor }} /> */}
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
                    </React.Fragment>
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
                {/* <button onClick={() => this.getValue()}>Get Data</button> */}
            </div>
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.daoTao.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getDmMonHocSdh, deleteSdhChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKienThuc);