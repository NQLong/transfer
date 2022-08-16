ALTER TABLE TC_DINH_MUC_HOC_PHI ADD NAM_HOC NVARCHAR2(11);
/

ALTER TABLE TC_DINH_MUC_HOC_PHI ADD BAC_DAO_TAO NVARCHAR2(5);
/

ALTER TABLE TC_DINH_MUC_HOC_PHI DROP (NAM_BAT_DAU,NAM_KET_THUC,SO_TIEN_MAC_DINH);
/

CREATE TABLE HCTH_CHU_KY (
    ID NUMBER(22,0) GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    SHCC NVARCHAR2(10) NOT NULL,
    NGAY_TAO NUMBER(20,0) NOT NULL,
    CONSTRAINT PK_HCTH_CHU_KY PRIMARY KEY (ID)
);
/

