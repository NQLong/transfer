module.exports = {
    trangThaiSwitcher: {
        MOI: { id: 0, text: 'Mới' },
        CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
        TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
        CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
        TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
        DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
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
        SEND: 'SEND'
    },

    CONG_VAN_TYPE: 'DEN',
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
        MOI: {
            id: 'MOI',
            text: 'Mới',
            value: 0,
        },

        DANG_XU_LY: {
            id: 'DANG_XU_LY',
            text: 'Đang xử lý',
            value: 1,
        },

        DA_HUY: {
            id: 'DA_HUY',
            value: 2,
            text: 'Đã hủy',
        },

        DA_XU_LY: {
            id: 'DA_XU_LY',
            text: 'Đã xử lý',
            value: 2,
        },

        TAM_HOAN: {
            id: 'TAM_HOAN',
            text: 'Tạm hoãn',
            value: 1,
        }
    }


};