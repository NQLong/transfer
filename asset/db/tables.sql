CREATE TABLE DM_LOAI_TAI_SAN_CO_DINH (
    MA NVARCHAR2(2) NOT NULL,
    TEN NVARCHAR2(200) NOT NULL,
    DON_VI_TINH NVARCHAR2(10),
    MA_NHOM NVARCHAR2(10),
    MA_TAI_KHOAN NVARCHAR2(10),
    MA_HIEU NVARCHAR2(10),
    CONSTRAINT PK_DM_LOAI_TAI_SAN_CO_DINH PRIMARY KEY (MA)
);
/

ALTER TABLE FW_DRAFT MODIFY DISPLAY_COVER NUMBER(1,0) DEFAULT 1;
/

ALTER TABLE FW_HOME_MENU MODIFY MA_DON_VI NVARCHAR2(5) DEFAULT '-1';
/

ALTER TABLE TCHC_CAN_BO ADD THUONG_TRU_MA_HUYEN NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD THUONG_TRU_MA_TINH NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD THUONG_TRU_MA_XA NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD THUONG_TRU_SO_NHA NVARCHAR2(200);
/

ALTER TABLE TCHC_CAN_BO ADD HIEN_TAI_MA_HUYEN NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD HIEN_TAI_MA_TINH NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD HIEN_TAI_MA_XA NVARCHAR2(10);
/

ALTER TABLE TCHC_CAN_BO ADD HIEN_TAI_SO_NHA NVARCHAR2(200);
/
