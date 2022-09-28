const vanBanDi = {
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
        KY_NOI_DUNG: { id: 'KY_NOI_DUNG', text: 'Ký nháy nội dung', level: 3, color: 'blue', height: 50, width: 50 },
        KY_THE_THUC: { id: 'KY_THE_THUC', text: 'Ký nháy thể thức', level: 3, color: 'blue', height: 50, width: 50 },
        /**NOTE: for van ban noi bo, ky phat hanh has level 1 but if its require red stamp then level would still be 2 */
        KY_PHAT_HANH: { id: 'KY_PHAT_HANH', text: 'Ký phát hành', level: 2, color: 'green', height: 75, width: 75 },
        SO_VAN_BAN: { id: 'SO_VAN_BAN', text: 'Số văn bản', color: 'blue' },
        DONG_DAU: { id: 'DONG_DAU', text: 'Đóng dấu mộc đỏ', level: 1, color: 'red', height: 100, width: 100 },
        KY_PHU_LUC: { id: 'KY_PHU_LUC', text: 'Ký phụ lục', level: 1, color: 'blue', phuLuc: 1 },
    }
}

export { vanBanDi };