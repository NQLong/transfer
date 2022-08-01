CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_INVOICE_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                                      searchTerm IN STRING, filter IN STRING,
                                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc             NUMBER(4);
    hocKy              NUMBER(1);
    tuNgay             NUMBER(20);
    denNgay            NUMBER(20);
    listBacDaoTao      NVARCHAR2(200);
    listLoaiHinhDaoTao NVARCHAR2(200);
    listKhoa           NVARCHAR2(500);
    listNganh          NVARCHAR2(500);
    nganHang           NVARCHAR2(500);

BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tuNgay') INTO tuNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.denNgay') INTO denNgay FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;
    SELECT JSON_VALUE(filter, '$.nganHang') INTO nganHang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI_TRANSACTION_INVOICE THPTI
             LEFT JOIN FW_STUDENT FS on THPTI.MSSV = FS.MSSV
             LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
    where THPTI.NAM_HOC = namHoc
--       and THPTI.STATUS = 1
      and THPTI.HOC_KY = hocKy
--       and (
--           (tuNgay is null and denNgay is null) or
--            (
--                        IS_NUMERIC(THPTI.TRANS_DATE) = 1
--                    and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
--                    and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
--                )
--         )
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listNganh IS NULL OR
           listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
      AND (listKhoa IS NULL OR
           listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
--       AND (nganHang IS NULL OR
--            THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
--                          from dual
--                          connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
      and (
                searchTerm = '' or
                LOWER(FS.HO) like sT or
                LOWER(NDT.TEN_NGANH) like sT or
                LOWER(BDT.TEN_BAC) like sT or
                LOWER(FS.MSSV) like sT or
                LOWER(FS.TEN) like sT
        );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT FS.MSSV                      AS                   "mssv",
                     THPTI.ID                     AS                   "id",
                     FS.HO                        AS                   "ho",
                     FS.TEN                       AS                   "ten",
                     THPTI.HOC_KY                 AS                   "hocKy",
--                      THPT.BANK                    as              "nganHang",
                     THPTI.NAM_HOC                AS                   "namHoc",
--                      THPT.AMOUNT                  AS              "khoanDong",
                     FS.MA_NGANH                  AS                   "maNganh",
                     NDT.TEN_NGANH                AS                   "tenNganh",
                     DV.TEN                       AS                   "tenKhoa",
                     LHDT.TEN                     AS                   "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC                  AS                   "tenBacDaoTao",
--                      THPT.TRANS_DATE              AS              "ngayDong",
--                      THPT.STATUS                  AS              "trangThai",
                     THPTI.INVOICE_TRANSACTION_ID AS                   "invoiceTransactonId",
                     THPTI.INVOICE_NUMBER         AS                   "invoiceNumber",
                     THPTI.ID                     AS                   "invoiceID",
--                      THPT.TRANS_ID                AS              "transactionId",

                     ROW_NUMBER() OVER (ORDER BY THPTI.INVOICE_NUMBER) R
              FROM TC_HOC_PHI_TRANSACTION_INVOICE THPTI
                       LEFT JOIN FW_STUDENT FS on THPTI.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
--                        LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE THPTI on THPT.TRANS_ID = THPTI.TRANSACTION_ID
              where THPTI.NAM_HOC = namHoc
                and THPTI.HOC_KY = hocKy
--                 and ((tuNgay is null and denNgay is null) or
--                      (
--                                  IS_NUMERIC(THPT.TRANS_DATE) = 1
--                              and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
--                              and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
--                          )
--                   )
--                 and THPT.STATUS = 1
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listNganh IS NULL OR
                     listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
                AND (listKhoa IS NULL OR
                     listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
                                                          from dual
                                                          connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
--                 AND (nganHang IS NULL OR
--                      THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
--                                    from dual
--                                    connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))

                and (
                          searchTerm = '' or
                          LOWER(FS.HO) like sT or
                          LOWER(NDT.TEN_NGANH) like sT or
                          LOWER(BDT.TEN_BAC) like sT or
                          LOWER(FS.MSSV) like sT or
                          LOWER(FS.TEN) like sT
                  )
             )


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

