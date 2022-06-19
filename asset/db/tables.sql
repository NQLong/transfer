ALTER TABLE TC_HOC_PHI_TRANSACTION ADD STATUS NUMBER(1,0) DEFAULT 1;
/

ALTER TABLE TC_HOC_PHI_TRANSACTION DROP (IS_SUCCESS);
/

ALTER TABLE TC_SETTING MODIFY VALUE NVARCHAR2(2000);
/

CREATE TABLE HCTH_CONG_VAN_TRINH_KY (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    NGUOI_TAO NVARCHAR2(10) NOT NULL,
    THOI_GIAN NUMBER(20,0) NOT NULL,
    CONG_VAN NUMBER(22,0) NOT NULL,
    CONSTRAINT PK_HCTH_CONG_VAN_TRINH_KY PRIMARY KEY (ID)
);
/

CREATE TABLE HCTH_CAN_BO_KY (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    NGUOI_KY NVARCHAR2(10) NOT NULL,
    CONG_VAN_TRINH_KY NUMBER(22,0) NOT NULL,
    TRANG_THAI NVARCHAR2(20),
    NGUOI_TAO NVARCHAR2(10),
    CONSTRAINT PK_HCTH_CAN_BO_KY PRIMARY KEY (ID)
);
/

CREATE TABLE TC_HOC_PHI_ORDERS (
    REF_ID NVARCHAR2(50) NOT NULL,
    NAM_HOC NUMBER(5,0),
    HOC_KY NUMBER(1,0),
    AMOUNT NUMBER(20,0),
    BANK NVARCHAR2(20),
    ORDER_INFO NVARCHAR2(2000),
    CONSTRAINT PK_TC_HOC_PHI_ORDERS PRIMARY KEY (REF_ID)
);
/

