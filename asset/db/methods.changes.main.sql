CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_GET_STATISTIC(filter IN STRING, tongSoGiaoDich OUT NUMBER) RETURN NUMBER
AS
    namHoc           NUMBER(10);
    hocKy            NUMBER(10);
    namTuyenSinh     NUMBER(10);
    bac              NVARCHAR2(10);
    nganh            NVARCHAR2(20);
    loaiHinh         NVARCHAR2(20);
    batDau           number(20);
    ketThuc          number(20);
    tongTienGiaoDich NUMBER(22);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiDaoTao') INTO loaiHinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.batDau') INTO batDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ketThuc') INTO ketThuc FROM DUAL;


    select COUNT(*)
    into tongSoGiaoDich
    from TC_HOC_PHI_TRANSACTION TT
             LEFT JOIN FW_STUDENT FS on TT.CUSTOMER_ID = FS.MSSV
    where TT.STATUS =1 and TT.NAM_HOC = namHoc
      and TT.HOC_KY = hocKy
      and FS.NAM_TUYEN_SINH = namTuyenSinh
      AND FS.BAC_DAO_TAO = bac
      AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)

      and (batDau is null or tt.TRANS_DATE >= batDau)
      and (ketThuc is null or tt.TRANS_DATE <= ketThuc)
      AND (nganh is null or FS.MA_NGANH = nganh)  ;

    select SUM(TT.AMOUNT)
    into tongTienGiaoDich
    from TC_HOC_PHI_TRANSACTION TT
             LEFT JOIN FW_STUDENT FS on TT.CUSTOMER_ID = FS.MSSV
    where TT.STATUS =1 and TT.NAM_HOC = namHoc
      and TT.HOC_KY = hocKy
      and FS.NAM_TUYEN_SINH = namTuyenSinh
      AND FS.BAC_DAO_TAO = bac
      AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)

      and (batDau is null or tt.TRANS_DATE >= batDau)
      and (ketThuc is null or tt.TRANS_DATE <= ketThuc)
      AND (nganh is null or FS.MA_NGANH = nganh);

    return tongTienGiaoDich;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_LOAI_PHI_GET_STATISTIC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    namHoc       NUMBER(10);
    hocKy        NUMBER(10);
    namTuyenSinh NUMBER(10);
    bac          NVARCHAR2(10);
    nganh        NVARCHAR2(20);
    loaiHinh     NVARCHAR2(20);
    loaiPhi      NVARCHAR2(256);
    batDau       number(20);
    ketThuc      number(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namTuyenSinh') INTO namTuyenSinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiDaoTao') INTO loaiHinh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiPhi') INTO loaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganh') INTO nganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.batDau') INTO batDau FROM DUAL;
    SELECT JSON_VALUE(filter, '$.ketThuc') INTO ketThuc FROM DUAL;


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
                         LEFT JOIN (select HP.MSSV,
                                           HP.NAM_HOC,
                                           HP.HOC_KY,
                                           HP.CONG_NO,
                                           TT.TRANS_DATE,
                                           row_number() over (partition by HP.MSSV order by TT.TRANS_DATE DESC) as ROW_ID
                                    from TC_HOC_PHI HP
                                             LEFT JOIN TC_HOC_PHI_TRANSACTION TT
                                                       on HP.MSSV = TT.CUSTOMER_ID and HP.NAM_HOC = TT.NAM_HOC and
                                                          HP.HOC_KY = TT.HOC_KY
                ) THP
                                   on FS.MSSV = THP.MSSV AND TD.HOC_KY = THP.HOC_KY and THP.NAM_HOC = TD.NAM_HOC and
                                      ROW_ID = 1
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  and THP.CONG_NO <= 0
                  and (batDau is null or THP.TRANS_DATE >= batDau)
                  and (ketThuc is null or THP.TRANS_DATE <= ketThuc)
                  AND (nganh is null or FS.MA_NGANH = nganh)) as "soTienDaDong",

               (SELECT count(*)
                from TC_HOC_PHI_DETAIL TD
                         LEFT JOIN FW_STUDENT FS on TD.MSSV = FS.MSSV
                         LEFT JOIN (select HP.MSSV,
                                           HP.NAM_HOC,
                                           HP.HOC_KY,
                                           HP.CONG_NO,
                                           TT.TRANS_DATE,
                                           row_number() over (partition by HP.MSSV order by TT.TRANS_DATE DESC) as ROW_ID
                                    from TC_HOC_PHI HP
                                             LEFT JOIN TC_HOC_PHI_TRANSACTION TT
                                                       on HP.MSSV = TT.CUSTOMER_ID and HP.NAM_HOC = TT.NAM_HOC and
                                                          HP.HOC_KY = TT.HOC_KY
                ) THP
                                   on FS.MSSV = THP.MSSV AND TD.HOC_KY = THP.HOC_KY and THP.NAM_HOC = TD.NAM_HOC and
                                      ROW_ID = 1
                WHERE TD.LOAI_PHI = LP.ID
                  and TD.NAM_HOC = namHoc
                  and TD.HOC_KY = hocKy
                  and FS.NAM_TUYEN_SINH = namTuyenSinh
                  AND FS.BAC_DAO_TAO = bac
                  AND FS.LOAI_HINH_DAO_TAO in (SELECT regexp_substr(loaiHinh, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(loaiHinh, '[^,]+', 1, level) is NOT NULL)
                  and THP.CONG_NO <= 0
                  and (batDau is null or THP.TRANS_DATE >= batDau)
                  and (ketThuc is null or THP.TRANS_DATE <= ketThuc)
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

