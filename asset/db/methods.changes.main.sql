CREATE OR REPLACE FUNCTION TC_HOC_PHI_GET_INVOICE_LIST(tuNgay in Number, denNgay in Number, hocKy in Number, namHoc in Number) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

BEGIN
    Open my_cursor for
        SELECT HP.MSSV         AS                           "mssv",
               HP.NAM_HOC      AS                           "namHoc",
               HP.HOC_KY       AS                           "hocKy",
               HP.CONG_NO      AS                           "congNo",
               HP.HOC_PHI      AS                           "hocPhi",
               FS.HO           as                           "ho",
               FS.TEN          AS                           "ten",
               FS.EMAIL_TRUONG AS                           "emailTruong",
               FS.MA_NGANH     AS                           "maNganh",
               NDT.TEN_NGANH   AS                           "tenNganh",
               DV.TEN          AS                           "tenKhoa",
               LHDT.TEN        AS                           "tenLoaiHinhDaoTao",

               (
                   SELECT LISTAGG(LP.TEN || '||' || TO_CHAR(dt.SO_TIEN), '|||') WITHIN GROUP (order by dt.LOAI_PHI)
                   from TC_HOC_PHI_DETAIL dt LEFT JOIN TC_LOAI_PHI LP
                   on LP.ID = dt.LOAI_PHI
                   where dt.MSSV = hp.MSSV and dt.HOC_KY = hp.HOC_KY and dt.NAM_HOC = hp.NAM_HOC
               )               AS                           "details",
               ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE) R
        FROM TC_HOC_PHI HP
                 LEFT JOIN FW_STUDENT FS
                           on HP.MSSV = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                 LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                           on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and HP.HOC_KY = HPI.HOC_KY
                 LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
            AND HP.NAM_HOC = THPT.NAM_HOC
            AND HP.MSSV = THPT.CUSTOMER_ID
            AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                   FROM TC_HOC_PHI_TRANSACTION TRANS
                                   WHERE HP.HOC_KY = TRANS.HOC_KY
                                     AND HP.NAM_HOC = TRANS.NAM_HOC
                                     AND HP.MSSV = TRANS.CUSTOMER_ID)
        WHERE HPI.ID is null
          and THPT.TRANS_DATE is not null
          and HP.NAM_HOC = namHoc
          AND HP.HOC_KY = hocKy
          and HP.CONG_NO = 0
          and ((tuNgay is null and denNgay is null) or
               (
                           IS_NUMERIC(THPT.TRANS_DATE) = 1
                       and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                       and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                   ))
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER, totalCurrent OUT NUMBER,
                                       totalPaid OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4); listBacDaoTao NVARCHAR2(200);
    hocKy     NUMBER(1); listLoaiHinhDaoTao NVARCHAR2(200);
    daDong    NUMBER(1); listKhoa NVARCHAR2(500);
    listNganh NVARCHAR2(500);
    tuNgay    NUMBER(20);
    denNgay   NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
             LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
        AND HP.NAM_HOC = THPT.NAM_HOC
        AND HP.MSSV = THPT.CUSTOMER_ID
        AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                               FROM TC_HOC_PHI_TRANSACTION TRANS
                               WHERE HP.HOC_KY = TRANS.HOC_KY
                                 AND HP.NAM_HOC = TRANS.NAM_HOC
                                 AND HP.MSSV = TRANS.CUSTOMER_ID)

    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV)
      AND (
            daDong IS NULL OR daDong = ''
            OR daDong = 1 AND HP.CONG_NO = 0
            OR daDong = 0 AND HP.CONG_NO != 0
        )
      AND (listNganh IS NULL OR
           listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
      AND (listKhoa IS NULL OR
           listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
      AND (HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
        OR FS.MSSV LIKE ST)
      and ((tuNgay is null and denNgay is null) or
           (
                       IS_NUMERIC(THPT.TRANS_DATE) = 1
                   and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                   and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
               )
        )
--        OR FS.MSSV LIKE ST
    ;

    SELECT COUNT(*)
    INTO totalCurrent
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy;

    SELECT COUNT(*)
    INTO totalPaid
    FROM TC_HOC_PHI HP
    WHERE NAM_HOC = namHoc
      AND HOC_KY = hocKy
      AND HP.CONG_NO = 0;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     FS.HO                    as         "ho",
                     FS.TEN                   AS         "ten",
                     FS.GIOI_TINH             AS         "gioiTinh",
                     FS.NGAY_SINH             AS         "ngaySinh",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     FS.DIEN_THOAI_CA_NHAN    AS         "soDienThoai",
                     FS.EMAIL_CA_NHAN         AS         "emailCaNhan",
                     FS.MA_NGANH              AS         "maNganh",
                     NDT.TEN_NGANH            AS         "tenNganh",
                     DV.TEN                   AS         "tenKhoa",
                     LHDT.TEN                 AS         "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC              AS         "tenBacDaoTao",
                     THPT.TRANS_ID            AS         "lastTransactionId",
                     THPT.TRANS_DATE          AS         "lastTransaction",
                     HPI.ID                   AS         "invoiceId",

--                      (SELECT TRANS_DATE
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransaction",
--
--                      (SELECT TRANS_ID
--                       FROM TC_HOC_PHI_TRANSACTION
--                       WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
--                                           FROM TC_HOC_PHI_TRANSACTION TRANS
--                                           WHERE HP.HOC_KY = TRANS.HOC_KY
--                                             AND HP.NAM_HOC = TRANS.NAM_HOC
--                                             AND HP.MSSV = TRANS.CUSTOMER_ID)) AS "lastTransactionId",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN, FS.HO, FS.MSSV) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS
                                 on HP.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                       LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE HPI
                                 on HPI.MSSV = HP.MSSV and HPI.NAM_HOC = HP.NAM_HOC and HP.HOC_KY = HPI.HOC_KY
                       LEFT JOIN TC_HOC_PHI_TRANSACTION THPT on HP.HOC_KY = THPT.HOC_KY
                  AND HP.NAM_HOC = THPT.NAM_HOC
                  AND HP.MSSV = THPT.CUSTOMER_ID
                  AND THPT.TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                         FROM TC_HOC_PHI_TRANSACTION TRANS
                                         WHERE HP.HOC_KY = TRANS.HOC_KY
                                           AND HP.NAM_HOC = TRANS.NAM_HOC
                                           AND HP.MSSV = TRANS.CUSTOMER_ID)
              WHERE (imssv IS NULL
                  OR imssv = ''
                  OR imssv = HP.MSSV)
                AND (
                      daDong IS NULL
                      OR daDong = ''
                      OR daDong = 1
                          AND HP.CONG_NO = 0
                      OR daDong = 0
                          AND HP.CONG_NO != 0
                  )
                AND (listNganh IS NULL
                  OR
                     listNganh IS NOT NULL
                         AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh
                                                        , '[^,]+'
                                                        , 1
                                                        , level)
                                             from dual
                                             connect by regexp_substr(listNganh
                                                            , '[^,]+'
                                                            , 1
                                                            , level) is not null))
                AND (listKhoa IS NULL
                  OR
                     listKhoa IS NOT NULL
                         AND FS.KHOA IN (SELECT regexp_substr(listKhoa
                                                    , '[^,]+'
                                                    , 1
                                                    , level)
                                         from dual
                                         connect by regexp_substr(listKhoa
                                                        , '[^,]+'
                                                        , 1
                                                        , level) is not null))
                AND (listBacDaoTao IS NULL
                  OR
                     listBacDaoTao IS NOT NULL
                         AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao
                                                   , '[^,]+'
                                                   , 1
                                                   , level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao
                                                       , '[^,]+'
                                                       , 1
                                                       , level) is not null))
                AND (listLoaiHinhDaoTao IS NULL
                  OR
                     listLoaiHinhDaoTao IS NOT NULL
                         AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao
                                                         , '[^,]+'
                                                         , 1
                                                         , level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao
                                                             , '[^,]+'
                                                             , 1
                                                             , level) is not null))
                AND (HP.NAM_HOC = namHoc
                  AND HP.HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR FS.MSSV LIKE ST)
                and ((tuNgay is null and denNgay is null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  ))


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
    ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_GET_DETAIL(maSoSinhVien in STRING, hocKy in Number, namHoc in Number) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    Open my_cursor for
        Select
        LP.TEN as "loaiPhi",
        dt.SO_TIEN as "soTien"
        from TC_HOC_PHI_DETAIL dt LEFT JOIN TC_LOAI_PHI LP on LP.ID = dt.LOAI_PHI where dt.MSSV = maSoSinhVien and dt.HOC_KY = hocKy and dt.NAM_HOC = namHoc;
    RETURN my_cursor;
END ;

/
--EndMethod--

