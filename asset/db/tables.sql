CREATE TABLE SV_CAU_HINH_NHAP_HOC (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    NAM_HOC NVARCHAR2(11),
    KHOA_SINH_VIEN NUMBER(4,0),
    HE_DAO_TAO NVARCHAR2(50),
    THOI_GIAN_BAT_DAU NUMBER(20,0),
    THOI_GIAN_KET_THUC NUMBER(20,0),
    USER_MODIFIED NVARCHAR2(100),
    TIME_MODIFIED NUMBER(20,0),
    CONSTRAINT PK_SV_CAU_HINH_NHAP_HOC PRIMARY KEY (ID)
);
/