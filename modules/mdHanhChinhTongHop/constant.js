module.exports = {
    trangThaiSwitcher: {
        MOI: { id: 0, text: 'Nháp' },
        CHO_DUYET: { id: 1, text: 'Chờ duyệt' },
        TRA_LAI_BGH: { id: 2, text: 'Trả lại' },
        CHO_PHAN_PHOI: { id: 3, text: 'Chờ phân phối' },
        TRA_LAI_HCTH: { id: 4, text: 'Trả lại (HCTH)' },
        DA_PHAN_PHOI: { id: 5, text: 'Đã phân phối' },
        DA_DUYET: { id: 6, text: 'Đã duyệt' }
    },

    trangThaiCongVanDi: {
        NHAP: { id: '1', text: 'Nháp' },
        XEM_XET: { id: '6', text: 'Xem xét' },
        CHO_KIEM_TRA: { id: '2', text: 'Chờ kiểm tra' },
        CHO_DUYET: { id: '3', text: 'Chờ duyệt' },
        TRA_LAI: { id: '4', text: 'Trả lại' },
        DA_XEM_XET: { id: '5', text: 'Đã xem xét' },
        DA_DUYET: { id: '7', text: 'Đã duyệt' },
        CHO_PHAN_PHOI: { id: '8', text: 'Chờ phân phối' },
        CHO_KY: { id: '9', text: 'Chờ ký' },
        DA_PHAN_PHOI: { id: '10', text: 'Đã phân phối' },
        TRA_LAI_PHONG: { id: '11', text: 'Trả lại (Đơn vị)' },
        TRA_LAI_HCTH: { id: '12', text: 'Trả lại (HCTH)' }
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
        WAIT_SIGN: 'WAIT_SIGN',
        DISTRIBUTE: 'DISTRIBUTE',
        UPDATE_SIGNING_CONFIG: 'UPDATE_SIGNING_CONFIG'
    },

    CONG_VAN_TYPE: 'DEN',
    CONG_VAN_DI_TYPE: 'DI',
    NHIEM_VU_TYPE: 'NHIEM_VU',
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
        'VAN_BAN_DEN': {
            id: 'VAN_BAN_DEN',
            text: 'Văn bản đến',
        },

        'VAN_BAN_DI': {
            id: 'VAN_BAN_DI',
            text: 'Văn bản đi',
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
            text: 'Văn bản đơn vị',
            color: 'blue',
        },
        TRUONG: {
            id: 'TRUONG',
            text: 'Văn bản trường',
            color: 'red',
        }
    },

    trangThaiRequest: {
        CHO_DUYET: { id: 'CHO_DUYET', text: 'Chờ duyệt' },
        DA_DUYET: { id: 'DA_DUYET', text: 'Đã duyệt' },
        TU_CHOI: { id: 'TU_CHOI', text: 'Từ chối' },
    },

    font: {
        TIMES_NEW_ROMAN: { text: 'Times new Roman', id: 'TIMES_NEW_ROMAN', color: 'red' },
    },

    vanBanDi: {
        trangThai: {
            NHAP: { text: 'Nháp', id: 'NHAP', color: 'red' },
            KIEM_TRA_NOI_DUNG: { text: 'Kiểm tra (nội dung)', id: 'KIEM_TRA_NOI_DUNG', color: 'blue' },
            TRA_LAI_NOI_DUNG: { text: 'Trả lại (nội dung)', id: 'TRA_LAI_NOI_DUNG', color: 'red' },
            KIEM_TRA_THE_THUC: { text: 'Kiểm tra (thê thức)', id: 'KIEM_TRA_THE_THUC', color: 'blue' },
            TRA_LAI_THE_THUC: { text: 'Trả lại (thể thức)', id: 'TRA_LAI_THE_THUC', color: 'red' },
            TRA_LAI: { text: 'Trả lại', id: 'TRA_LAI', color: 'red' },
            KY_THE_THUC: { text: 'Ký nháy thể thức', id: 'KY_THE_THUC', color: 'blue' },
            KY_NOI_DUNG: { text: 'Ký nháy nội dung', id: 'KY_NOI_DUNG', color: 'blue' },
            KY_PHAT_HANH: { text: 'Ký phát hành', id: 'KY_PHAT_HANH', color: 'blue' },
            DONG_DAU: { text: 'Đóng dấu mộc đỏ', id: 'DONG_DAU', color: 'blue' },
            DA_PHAT_HANH: { text: 'Đã phát hành', id: 'DA_PHAT_HANH', color: 'green' },
        },

        loaiCongVan: {
            DON_VI: { id: 'DON_VI', text: 'Văn bản đơn vị', color: 'blue', },
            TRUONG: { id: 'TRUONG', text: 'Văn bản trường', color: 'red', }
        },

        signType: {
            NOI_DUNG: { id: 'NOI_DUNG', text: 'Ký nháy nội dung', level: 3, color: 'blue', height: 50, width: 50 },
            THE_THUC: { id: 'THE_THUC', text: 'Ký nháy thể thức', level: 3, color: 'blue', height: 50, width: 50 },
            /**NOTE: for van ban noi bo, ky phat hanh has level 1 but if its require red stamp then level would still be 2 */
            KY_PHAT_HANH: { id: 'KY_PHAT_HANH', text: 'Ký phát hành', level: 2, color: 'green', height: 75, width: 75 },
            SO_VAN_BAN: { id: 'SO_VAN_BAN', text: 'Số văn bản', color: 'blue' },
            MOC_DO: { id: 'MOC_DO', text: 'Đóng mộc đỏ', level: 1, color: 'red', height: 100, width: 100 },
            KY_PHU_LUC: { id: 'KY_PHU_LUC', text: 'Ký phụ lục', level: 1, color: 'blue', phuLuc: 1 },

        }
    }
};