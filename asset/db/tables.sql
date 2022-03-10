CREATE TABLE DM_LOAI_CHI_PHI (
    MA NVARCHAR2(2) NOT NULL,
    TEN NVARCHAR2(50),
    KICH_HOAT NUMBER(1,0) DEFAULT 1,
    CONSTRAINT PK_DM_LOAI_CHI_PHI PRIMARY KEY (MA)
) /**/

ALTER TABLE QT_CONG_TAC_TRONG_NUOC ADD LOAI_CHI_PHI NVARCHAR2(2);
/

ALTER TABLE QT_DI_NUOC_NGOAI ADD LOAI_CHI_PHI NVARCHAR2(2);
/

ALTER TABLE QT_KHEN_THUONG_ALL ADD SO_QUYET_DINH NVARCHAR2(30);
/

ALTER TABLE QT_KY_LUAT ADD SO_QUYET_DINH NVARCHAR2(20);
/

ALTER TABLE QT_KY_LUAT ADD NGAY_RA_QUYET_DINH NUMBER(20,0);
/

ALTER TABLE QT_KY_LUAT DROP (BAT_DAU,KET_THUC,BAT_DAU_TYPE,KET_THUC_TYPE);
/

