ALTER TABLE HCTH_CONG_VAN_DEN ADD NGUOI_TAO NVARCHAR2(20);
/

ALTER TABLE HCTH_CONG_VAN_DI ADD NGAY_TAO NUMBER(20,0);
/

ALTER TABLE DT_CHUONG_TRINH_DAO_TAO ADD TINH_CHAT_MON NUMBER(1,0) DEFAULT 0;
/

ALTER TABLE DT_KHUNG_DAO_TAO ADD CHUYEN_NGANH NVARCHAR2(20);
/

ALTER TABLE QT_HOP_DONG_DON_VI_TRA_LUONG ADD CHUC_DANH_NGHE_NGHIEP NVARCHAR2(20);
/

ALTER TABLE QT_HOP_DONG_DON_VI_TRA_LUONG DROP (CHUC_DANH);
/

