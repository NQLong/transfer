ALTER TABLE DM_DON_VI ADD HOME_LANGUAGE NVARCHAR2(100);
/

ALTER TABLE DV_WEBSITE MODIFY SHORTNAME NVARCHAR2(20);
/

ALTER TABLE TCHC_CAN_BO MODIFY TY_LE_PHU_CAP_UU_DAI NUMBER(5,0);
/

ALTER TABLE DT_DANG_KY_MO_MON ADD LOAI_HINH_DAO_TAO NVARCHAR2(10);
/

ALTER TABLE DT_DANG_KY_MO_MON ADD BAC_DAO_TAO NVARCHAR2(5);
/

ALTER TABLE DT_THOI_GIAN_MO_MON ADD LOAI_HINH_DAO_TAO NVARCHAR2(5);
/

ALTER TABLE DT_THOI_GIAN_MO_MON ADD BAC_DAO_TAO NVARCHAR2(5);
/

CREATE TABLE DM_NGON_NGU_TRUYEN_THONG (
    MA_CODE NVARCHAR2(3) NOT NULL,
    TEN_NGON_NGU NVARCHAR2(100),
    CONSTRAINT PK_DM_NGON_NGU_TRUYEN_THONG PRIMARY KEY (MA_CODE)
);
/

CREATE TABLE FW_SMS_TEMPLATE (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    DON_VI NUMBER(22,0),
    CONTENT CLOB,
    TIME_APPROVED NUMBER(20,0),
    APPROVER NVARCHAR2(50),
    PURPOSE NUMBER(22,0),
    ACTIVE NUMBER(1,0) DEFAULT 1,
    CONSTRAINT PK_FW_SMS_TEMPLATE PRIMARY KEY (ID)
);
/

CREATE TABLE FW_SMS_TEMPLATE_DRAFT (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    DON_VI NUMBER(22,0),
    EMAIL NVARCHAR2(50),
    CONTENT NVARCHAR2(200),
    LAST_MODIFIED NUMBER(20,0),
    APPROVED NUMBER(1,0) DEFAULT 0,
    REPLY NVARCHAR2(100),
    REPLY_TIME NUMBER(20,0),
    CONSTRAINT PK_FW_SMS_TEMPLATE_DRAFT PRIMARY KEY (ID)
);
/

CREATE TABLE TC_THONG_TIN (
    NAM_HOC NUMBER(4,0),
    HOC_KY NUMBER(1,0),
    NGAY_BAT_DAU NUMBER(20,0),
    NGAY_KET_THUC NUMBER(20,0),
    DON_GIA NUMBER(22,0),
    MODIFIED_DATE NUMBER(20,0)
);
/

