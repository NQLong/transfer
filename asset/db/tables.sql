ALTER TABLE QT_KEO_DAI_CONG_TAC ADD SO_QUYET_DINH NVARCHAR2(50);
/

ALTER TABLE QT_KEO_DAI_CONG_TAC ADD NGAY_QUYET_DINH NUMBER(20,0);
/

ALTER TABLE QT_KEO_DAI_CONG_TAC DROP (SO_HIEU_VAN_BAN);
/

ALTER TABLE QT_NGHIEN_CUU_KHOA_HOC ADD HINH_THUC NVARCHAR2(20);
/

ALTER TABLE QT_NGHIEN_CUU_KHOA_HOC ADD TINH_TRANG NVARCHAR2(10);
/

ALTER TABLE QT_NGHIEN_CUU_KHOA_HOC ADD MA_SO NVARCHAR2(20);
/

ALTER TABLE QT_NGHIEN_CUU_KHOA_HOC ADD CAP_QUAN_LY NVARCHAR2(20);
/

ALTER TABLE QT_NGHIEN_CUU_KHOA_HOC ADD QUY_MO NVARCHAR2(20);
/

ALTER TABLE QT_NGHI_VIEC ADD NGAY_QUYET_DINH NUMBER(22,0);
/

ALTER TABLE QT_NGHI_VIEC ADD LY_DO_NGHI NVARCHAR2(2);
/

CREATE TABLE DM_NGHI_VIEC (
    MA NVARCHAR2(2) NOT NULL,
    TEN NVARCHAR2(100),
    KICH_HOAT NUMBER(1,0) DEFAULT 1,
    CONSTRAINT PK_DM_NGHI_VIEC PRIMARY KEY (MA)
);
/

CREATE TABLE QT_HOP_DONG_DON_VI_TRA_LUONG (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    SHCC NVARCHAR2(10),
    LOAI_HOP_DONG NUMBER(22,0),
    NGUOI_KY NVARCHAR2(10),
    NGAY_KY_HOP_DONG NUMBER(20,0),
    BAT_DAU_LAM_VIEC NUMBER(20,0),
    KET_THUC_HOP_DONG NUMBER(20,0),
    NGAY_TAI_KY NUMBER(20,0),
    DON_VI_TRA_LUONG NUMBER(22,0),
    CHUC_DANH NUMBER(22,0),
    NGACH NUMBER(22,0),
    BAC NUMBER(22,0),
    HE_SO NVARCHAR2(5),
    PHAN_TRAM_HUONG NUMBER(3,0),
    SO_HOP_DONG NVARCHAR2(100),
    CONSTRAINT PK_QT_HOP_DONG_DON_VI_TRA_LUONG PRIMARY KEY (ID)
);
/

DROP TABLE FW_USER_NOTIFICATION;
/

