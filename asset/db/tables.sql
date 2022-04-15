ALTER TABLE DM_NGANH_DAO_TAO MODIFY MA NUMBER(20,0);
/

ALTER TABLE HCTH_CONG_VAN_DEN ADD SO_DEN NVARCHAR2(32);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU ADD TIEU_DE NVARCHAR2(255);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU ADD NGAY_BAT_DAU NUMBER(20,0);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU ADD NGAY_KET_THUC NUMBER(20,0);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU ADD DO_UU_TIEN NUMBER(5,0);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU ADD NGAY_TAO NUMBER(20,0);
/

ALTER TABLE HCTH_GIAO_NHIEM_VU DROP (NGAY_HET_HAN,TRANG_THAI);
/

ALTER TABLE TCHC_CAN_BO ADD IS_CVDT NUMBER(1,0) DEFAULT 0;
/

ALTER TABLE TCHC_CAN_BO ADD IS_HDTN NUMBER(1,0) DEFAULT 0;
/

ALTER TABLE DM_MON_HOC MODIFY MA NVARCHAR2(20) NULL;
/

ALTER TABLE DM_MON_HOC MODIFY TEN NVARCHAR2(1000);
/

ALTER TABLE DM_MON_HOC ADD KHOA NUMBER(22,0);
/

ALTER TABLE DM_MON_HOC ADD TIN_CHI_LT NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD TIN_CHI_TH NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD TIET_LT NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD TIET_TH NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD TONG_TIET NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD TIEN_QUYET NVARCHAR2(20);
/

ALTER TABLE DM_MON_HOC ADD TONG_TIN_CHI NUMBER(5,0);
/

ALTER TABLE DM_MON_HOC ADD ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL;
/

ALTER TABLE DM_MON_HOC ADD PHAN_HOI NVARCHAR2(1000);
/

ALTER TABLE DM_MON_HOC DROP (SO_TIN_CHI,TONG_SO_TIET,SO_TIET_LT,SO_TIET_TH,SO_TIET_TT,SO_TIET_TL,SO_TIET_DA,SO_TIET_LA,TINH_CHAT_PHONG,TEN_TIENG_ANH,BO_MON,LOAI_HINH,CHUYENH_NGANH,GHI_CHU,MA_CTDT,TEN_CTDT);
/

ALTER TABLE DT_DANH_SACH_CHUYEN_NGANH ADD NGANH NVARCHAR2(20);
/

CREATE TABLE HCTH_LIEN_KET (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    LOAI_A NVARCHAR2(10),
    DON_VI_A NUMBER(10,0),
    KEY_A NUMBER(10,0),
    DON_VI_B NUMBER(10,0),
    KEY_B NUMBER(10,0),
    CHIEU NUMBER(10,0),
    CONSTRAINT PK_HCTH_LIEN_KET PRIMARY KEY (ID)
);
/

