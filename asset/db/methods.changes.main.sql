CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_GET_STATISTIC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    namHoc       NUMBER(10);
    hocKy        NUMBER(10);
    namTuyenSinh NUMBER(10);
    bac          NVARCHAR2(10);
    nganh        NVARCHAR2(20);
    loaiHinh     NVARCHAR2(20);
    loaiPhi      NVARCHAR2(256);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiDaoTao') INTO loaiHinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiPhi') INTO loaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;


    OPEN my_cursor for
        SELECT LP.ID                                          as "id",
               LP.TEN                                         AS "ten",
               (SELECT sum(TD.SO_TIEN)
                from TC_HOC_PHI_DETAIL TD
                         LEFT JOIN FW_STUDENT FS on TD.MSSV = FS.MSSV
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                        from dual
                        connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  AND (nganh is null or FS.MA_NGANH = nganh)) as "soTienDuKien",

               (SELECT count(*)
                from TC_HOC_PHI_DETAIL TD
                         LEFT JOIN FW_STUDENT FS on TD.MSSV = FS.MSSV
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                        from dual
                        connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  AND (nganh is null or FS.MA_NGANH = nganh)) as "soLuongDuKien",

               (SELECT sum(TD.SO_TIEN)
                from TC_HOC_PHI_DETAIL TD
                         LEFT JOIN FW_STUDENT FS on TD.MSSV = FS.MSSV
                         LEFT JOIN TC_HOC_PHI THP
                                   on FS.MSSV = THP.MSSV AND TD.HOC_KY = THP.HOC_KY and THP.NAM_HOC = TD.NAM_HOC
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                        from dual
                        connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  and THP.CONG_NO <= 0
                  AND (nganh is null or FS.MA_NGANH = nganh)) as "soTienDaDong",

               (SELECT count(*)
                from TC_HOC_PHI_DETAIL TD
                         LEFT JOIN FW_STUDENT FS on TD.MSSV = FS.MSSV
                         LEFT JOIN TC_HOC_PHI THP
                                   on FS.MSSV = THP.MSSV AND TD.HOC_KY = THP.HOC_KY and THP.NAM_HOC = TD.NAM_HOC
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                        from dual
                        connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  and THP.CONG_NO <= 0
                  AND (nganh is null or FS.MA_NGANH = nganh)) as "soLuongDaDong"
        FROM TC_LOAI_PHI LP
        WHERE LP.ID in (SELECT regexp_substr(loaiPhi, '[^,]+', 1, level)
                        from dual
                        connect by regexp_substr(loaiPhi, '[^,]+', 1, level) is NOT NULL)
    ORDER BY LP.ID;
    return my_cursor;
END;

/
--EndMethod--

