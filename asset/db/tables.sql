ALTER TABLE SV_BAO_HIEM_Y_TE ADD MA_BHXH_HIEN_TAI NUMBER(10,0);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD BENH_VIEN_DANG_KY NVARCHAR2(10);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD MAT_TRUOC_THE NVARCHAR2(100);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD MAT_SAU_THE NVARCHAR2(100);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD THOI_GIAN_HOAN_THANH NUMBER(20,0);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD NAM_DANG_KY NUMBER(4,0);
/

ALTER TABLE SV_BAO_HIEM_Y_TE ADD GIA_HAN NUMBER(1,0);
/

CREATE TABLE SV_BHYT_PHU_LUC_CHU_HO (
    MSSV NVARCHAR2(10) NOT NULL,
    ID_DANG_KY NUMBER(22,0),
    HO_TEN_CHU_HO NVARCHAR2(200),
    DIEN_THOAI_CHU_HO NUMBER(10,0),
    SO_NHA_CHU_HO NVARCHAR2(50),
    MA_XA_CHU_HO NUMBER(10,0),
    MA_HUYEN_CHU_HO NUMBER(10,0),
    MA_TINH_CHU_HO NUMBER(5,0),
    CONSTRAINT PK_SV_BHYT_PHU_LUC_CHU_HO PRIMARY KEY (MSSV)
);
/

CREATE TABLE SV_DM_DIEN_DONG_BHYT (
    MA NUMBER(22,0) NOT NULL,
    TEN NVARCHAR2(50),
    MO_TA NVARCHAR2(1000),
    SO_TIEN NUMBER(22,0),
    NAM_HOC NVARCHAR2(13),
    CONSTRAINT PK_SV_DM_DIEN_DONG_BHYT PRIMARY KEY (MA)
);
/

CREATE TABLE DM_CO_SO_KCB_BHYT (
    MA NUMBER(5,0) NOT NULL,
    TEN NVARCHAR2(100),
    DIA_CHI NVARCHAR2(500),
    LOAI_DANG_KY NUMBER(2,0),
    GHI_CHU NVARCHAR2(2000),
    LOAI_CO_SO NUMBER(22,0),
    CONSTRAINT PK_DM_CO_SO_KCB_BHYT PRIMARY KEY (MA)
);
/

CREATE TABLE SV_BHYT_PHU_LUC_THANH_VIEN (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    MSSV NVARCHAR2(10),
    ID_DANG_KY NUMBER(22,0),
    HO_TEN NVARCHAR2(100),
    MA_SO_BHXH NUMBER(10,0),
    NGAY_SINH NUMBER(20,0),
    GIOI_TINH NUMBER(2,0),
    MA_XA_NOI_CAP_KHAI_SINH NUMBER(10,0),
    MA_HUYEN_NOI_CAP_KHAI_SINH NUMBER(10,0),
    MA_TINH_NOI_CAP_KHAI_SINH NUMBER(4,0),
    MOI_QUAN_HE_CHU_HO NVARCHAR2(2),
    CCCD NUMBER(12,0),
    GHI_CHU NVARCHAR2(1000),
    CONSTRAINT PK_SV_BHYT_PHU_LUC_THANH_VIEN PRIMARY KEY (ID)
);
/