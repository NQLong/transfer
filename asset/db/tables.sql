ALTER TABLE FW_STUDENT MODIFY KHU_VUC_TUYEN_SINH NVARCHAR2(7);
/

ALTER TABLE FW_SMS_TEMPLATE ADD IS_TIENG_VIET NUMBER(1,0);
/

ALTER TABLE DM_PHUONG_THUC_TUYEN_SINH MODIFY TEN NVARCHAR2(256);
/

CREATE TABLE FW_EMAIL_LOG (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    USED_EMAIL NVARCHAR2(64),
    TO_USER NVARCHAR2(20),
    TO_EMAIL NVARCHAR2(64),
    MAIL_TYPE NVARCHAR2(128),
    CONSTRAINT PK_FW_EMAIL_LOG PRIMARY KEY (ID)
);
/