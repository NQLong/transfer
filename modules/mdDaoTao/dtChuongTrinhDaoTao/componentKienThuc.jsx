import { SelectAdapter_DmMonHoc, SelectAdapter_DmMonHocFaculty, getDmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao } from './redux';
export class ComponentKienThuc extends AdminPage {
    rows = {};
    state = { datas: {} };

    // componentDidMount() {
    //     this.addRow(0);
    // }

    addRow = (idx, item) => {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['write']);
        const id = item ? item.id : -1;
        const editFlag = permission.write ? (id > 0 ? false : true) : false;
        console.log(item, editFlag);
        this.rows[idx] = {
            maMonHoc: null,
            loaiMonHoc: null,
            tongSoTc: null,
            tinChiLyThuyet: null,
            tinChiThucHanh: null,
            soTiet: null,
            phongTn: null,
        };
        this.setEditState(idx, editFlag, id, () => {
            this.rows[idx].loaiMonHoc.value(item ? item.loaiMonHoc : 0);
            this.rows[idx].tinChiLyThuyet.value(item ? item.tinChiLyThuyet : 0);
            this.rows[idx].tinChiThucHanh.value(item ? item.tinChiThucHanh : 0);
            if (item) {
                SelectAdapter_DmMonHoc.fetchOneItem(item.maMonHoc, ({ item }) => {
                    const { soTinChi, tongSoTiet } = item;
                    // this.setEditState(idx, true, this.state.datas[idx].id);
                    this.rows[idx].tongSoTc.value(soTinChi);
                    this.rows[idx].soTiet.value(tongSoTiet);
                });
                this.rows[idx].maMonHoc.value(item.maMonHoc);
            }
        });
    }

    setEditState = (idx, editFlag, id, done) => {
        this.setState({
            datas: {
                ...this.state.datas,
                [idx]: {
                    edit: editFlag,
                    id: id,
                }
            }
        }, () => {
            done && done();
        });
    }

    editRow = (idx) => {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['write']);
        if (permission.write) {
            const curEdit = this.state.datas[idx].edit;
            const id = this.state.datas[idx].id;
            this.setEditState(idx, !curEdit, id, () => {
                this.rows[idx].maMonHoc.value(this.rows[idx].maMonHoc.value());
                this.rows[idx].loaiMonHoc.value(this.rows[idx].loaiMonHoc.value());
            });
        }
    }

    removeRow = (idx) => {
        delete this.rows[idx];
    }

    setMonHoc = (idx, id) => {
        if (this.rows[idx - 1] && this.state.datas[idx - 1]?.edit) {
            this.editRow(idx - 1);
        }
        SelectAdapter_DmMonHoc.fetchOneItem(id, ({ item }) => {
            const { soTinChi, tongSoTiet } = item;
            // this.setEditState(idx, true, this.state.datas[idx].id);
            this.rows[idx].tongSoTc.value(soTinChi);
            this.rows[idx].soTiet.value(tongSoTiet);
            this.addRow(idx + 1);
        });

    }

    selectMh = (idx) => {
        return (<FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocFaculty(33)} className='col-12' style={{ marginBottom: 0 }} readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(idx, value.id)} />);
    };
    insertLoaiMh = (idx) => {
        return (<FormSelect ref={e => this.rows[idx].loaiMonHoc = e} data={[{ id: 0, text: 'Bắt buộc' }, { id: 1, text: 'Tự chọn' }]} className='col-12' style={{ marginBottom: 0 }} readOnly={!this.state.datas[idx].edit} />);
    };
    insertTongSoTc = (idx) => {
        return (<FormTextBox type="number" ref={e => this.rows[idx].tongSoTc = e} className='col-12' readOnly={true} style={{ marginBottom: 0 }} />);
    };
    insertTinChiLt = (idx) => {
        return (<FormTextBox type="number" ref={e => this.rows[idx].tinChiLyThuyet = e} className='col-12' readOnly={!this.state.datas[idx].edit} max={999} style={{ marginBottom: 0 }} />);
    };
    insertTinChiTh = (idx) => {
        return (<FormTextBox type="number" ref={e => this.rows[idx].tinChiThucHanh = e} className='col-12' readOnly={!this.state.datas[idx].edit} style={{ marginBottom: 0 }} />);
    };
    insertSoTiet = (idx) => {
        return (<FormTextBox type="number" ref={e => this.rows[idx].soTiet = e} className='col-12' readOnly={true} style={{ marginBottom: 0 }} />);
    };
    insertPhongTn = (idx) => {
        return (<FormTextBox type="text" ref={e => this.rows[idx].phongTn = e} className='col-12' readOnly={!this.state.datas[idx].edit} style={{ marginBottom: 0 }} />);
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
            const data = [];
            keys.forEach((key) => {
                const item = {
                    id: this.state.datas[key].id,
                    maMonHoc: this.rows[key].maMonHoc?.value(),
                    loaiMonHoc: this.rows[key].loaiMonHoc?.value(),
                    tinChiLyThuyet: this.rows[key].tinChiLyThuyet?.value(),
                    tinChiThucHanh: this.rows[key].tinChiThucHanh?.value(),
                    phongTn: this.rows[key].phongTn?.value(),
                    maKhoiKienThuc: '1',
                };
                if (item.maMonHoc) {
                    data.push(item);
                }
            });
            return data;
        } catch (e) {
            return false;
        }
    }

    setVal = (items = []) => {
        items.forEach((item, idx) => {
            // const { id, loaiMonHoc, maMonHoc, phongThiNghiem, tinChiLyThuyet, tinChiThucHanh } =
            //     item ? item : { id: '', loaiMonHoc: 0, maMonHoc: '', phongThiNghiem: null, tinChiLyThuyet: null, tinChiThucHanh: null };

            this.addRow(idx, item);
        });
        this.addRow(items.length);


    }


    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'readAll', 'write', 'delete']);
        const title = this.props.title;

        const table = renderTable({
            getDataSource: () => this.convertObjToArr(),
            stickyHead: false,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>#</th>
                        <th rowSpan='2' style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tên Môn Học</th>
                        <th rowSpan='2' style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Loại MH</th>
                        <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ
                        </th>
                        <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Số tiết</th>
                        <th rowSpan='2' style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Phòng TN</th>
                        <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>TC</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                        <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                    </tr>

                </>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.id > 0 ? item.id : null} />
                    <TableCell content={this.selectMh(index)} />
                    <TableCell content={this.insertLoaiMh(index)} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTongSoTc(index)} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTinChiLt(index)} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTinChiTh(index)} />
                    <TableCell type='number' content={this.insertSoTiet(index)} />
                    <TableCell type='number' content={this.insertPhongTn(index)} />
                    <td rowSpan={1} colSpan={1}>
                        <div className='btn-group'>
                            {
                                permission.write ?
                                    <a className='btn btn-primary' href='#' title={!item.edit ? 'Chỉnh sửa' : 'Xong'} onClick={() => this.editRow(index)}><i className={'fa fa-lg ' + (!item.edit ? 'fa-edit' : 'fa-check')} /></a> : null
                            }

                        </div>
                    </td>
                </tr>
            ),
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
const mapActionsToProps = { getDmMonHoc, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKienThuc);