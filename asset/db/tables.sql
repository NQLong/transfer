ALTER TABLE SDH_CHUONG_TRINH_DAO_TAO ADD HOC_KY NUMBER(1,0);
/

CREATE TABLE SDH_DM_THOI_GIAN_DAO_TAO (
    SO_NAM NUMBER(22,0) NOT NULL,
    KICH_HOAT NUMBER(1,0),
    CONSTRAINT PK_SDH_DM_THOI_GIAN_DAO_TAO PRIMARY KEY (SO_NAM)
);
/