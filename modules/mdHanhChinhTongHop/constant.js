module.exports = {
    trangThaiSwitcher: {
        MOI: { id: 0, text: 'Nháp' },
        CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
        TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
        CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
        TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
        DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
    },

    trangThaiCongVanDi: {
        MOI: { id: '1', text: 'Mới' },
        CHO_KIEM_TRA: { id: '2', text: 'Chờ kiểm tra' },
        CHO_DUYET: { id: '3', text: 'Chờ duyệt' },
        TRA_LAI: { id: '4', text: 'Trả lại' },
        DA_GUI: { id: '5', text: 'Đã gửi' },
        DA_DOC: { id: '6', text: 'Đã đọc' },
        DA_DUYET: { id: '7', text: 'Đã duyệt' },
    },

    action: {
        CREATE: 'CREATE',
        UPDATE: 'UPDATE',
        RETURN: 'RETURN',
        APPROVE: 'APPROVE',
        PUBLISH: 'PUBLISH',
        UPDATE_STATUS: 'UPDATE_STATUS',
        ACCEPT: 'ACCEPT',
        READ: 'READ',
        SEND: 'SEND',
        ADD_EMPLOYEES: 'ADD_EMPLOYEES',
        REMOVE_EMPOYEE: 'REMOVE_EMPLOYEE',
        CHANGE_ROLE: 'CHANGE_ROLE',
        COMPLETE: 'COMPLETE',
        CLOSE: 'CLOSE',
        REOPEN: 'REOPEN',
        RESET: 'RESET',
        VIEW: 'VIEW',
        ADD_SIGN_REQUEST: 'ADD_SIGN_REQUEST',
        REMOVE_SIGN_REQUEST: 'REMOVE_SIGN_REQUEST',
        UPDATE_SIGN_REQUEST: 'UPDATE_SIGN_REQUEST',
    },

    CONG_VAN_TYPE: 'DEN',
    CONG_VAN_DI_TYPE: 'DI',
    MA_CHUC_VU_HIEU_TRUONG: '001',
    MA_BAN_GIAM_HIEU: '68',
    MA_HCTH: '29',
    MA_TRUONG_PHONG: '003',
    MA_TRUONG_KHOA: '009',

    handleResult: (resolve, reject, item, error) => {
        if (error) {
            reject(error);
        }
        else
            resolve(item);
    },

    vaiTro: {
        MANAGER: { id: 'MANAGER', text: 'Quản trị viên', color: 'red' },
        PARTICIPANT: { id: 'PARTICIPANT', text: 'Người tham gia', color: 'blue' },
    },

    canBoType: {
        HCTH: 'HCTH',
        RECTOR: 'RECTOR'
    },

    doUuTienMapper: {
        URGENT: {
            id: 'URGENT',
            text: 'Khẩn cấp',
            color: 'red'
        },

        NORMAL: {
            id: 'NORMAL',
            text: 'Thường',
            color: 'blue'
        }
    },

    loaiLienKet: {
        'CONG_VAN_DEN': {
            id: 'CONG_VAN_DEN',
            text: 'Công văn đến',
        },

        'CONG_VAN_DI': {
            id: 'CONG_VAN_DI',
            text: 'Công văn các phòng',
        }
    },

    trangThaiNhiemVu: {
        DONG: { id: 'DONG', text: 'Đóng', value: 2, color: 'red' },
        MO: { id: 'MO', text: 'Mở', value: 0, color: '#149414' }
    },

    nhiemVuSelector: {
        NHIEM_VU_CAC_DON_VI: { id: 'NHIEM_VU_CAC_DON_VI', text: 'Nhiệm vụ các đơn vị' },
        NHIEM_VU_DON_VI: { id: 'NHIEM_VU_DON_VI', text: 'Nhiệm vụ của đơn vị' },
        NHIEM_VU_CUA_BAN: { id: 'NHIEM_VU_CUA_BAN', text: 'Nhiệm vụ của bạn' },
        NHIEM_VU_THAM_GIA: { id: 'NHIEM_VU_THAM_GIA', text: 'Nhiệm vụ đang tham gia' },
    },

    loaiCongVan: {
        DON_VI: {
            id: 'DON_VI',
            text: 'Công văn đơn vị',
            color: 'blue',
        },
        TRUONG: {
            id: 'TRUONG',
            text: 'Công văn trường',
            color: 'red',
        }
    }
};