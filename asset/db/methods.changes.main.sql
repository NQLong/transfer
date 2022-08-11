CREATE OR REPLACE FUNCTION SDH_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              searchTerm IN STRING, filter IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(502) := '%' || lower(searchTerm) || '%';
    donVi              STRING(10);
    namDaoTao          NUMBER(4);
    listBacDaoTao STRING(50);
    heDaoTaoFilter     STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namDaoTao') INTO namDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.heDaoTaoFilter') INTO heDaoTaoFilter FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM SDH_KHUNG_DAO_TAO KDT
--              LEFT JOIN SDH_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
             LEFT JOIN DM_NGANH_SAU_DAI_HOC DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
             LEFT JOIN SDH_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

    WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND
           KDT.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
        OR LOWER(TRIM(DNDT.TEN)) LIKE sT
        OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT)
      AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.BAC_DAO_TAO)
      AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT KDT.MA_KHOA           AS                          "maKhoa",
                     KDT.NAM_DAO_TAO       AS                          "idNamDaoTao",
                     KHUNG.NAM_DAO_TAO     AS                          "namDaoTao",
                     KDT.ID                AS                          "id",
                     KDT.MA_NGANH          AS                          "maNganh",
                     DNDT.TEN              AS                          "tenNganh",
                     BDT.TEN_BAC           AS                          "trinhDoDaoTao",
                     LHDT.TEN              AS                          "loaiHinhDaoTao",
                     KDT.THOI_GIAN_DAO_TAO AS                          "thoiGianDaoTao",
                     DV.TEN                AS                          "tenKhoaBoMon",
--                      CN.TEN                AS                          "tenChuyenNganh",
                     ROW_NUMBER() OVER (ORDER BY KDT.NAM_DAO_TAO DESC) R
              FROM SDH_KHUNG_DAO_TAO KDT
--                        LEFT JOIN SDH_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
                       LEFT JOIN DM_NGANH_SAU_DAI_HOC DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
                       LEFT JOIN SDH_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = KDT.TRINH_DO_DAO_TAO
                       LEFT JOIN DM_HOC_SDH LHDT ON LHDT.MA = KDT.BAC_DAO_TAO
              WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     KDT.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
                  OR LOWER(TRIM(DNDT.TEN)) LIKE sT
                  OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT)
                AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.BAC_DAO_TAO)
                AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO)
              ORDER BY KDT.NAM_DAO_TAO DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SV_NHAP_HOC_GET_DATA(pMssv IN STRING, config IN STRING) RETURN sys_refcursor
AS
    my_cur SYS_REFCURSOR;
    namHoc NUMBER(4);
    hocKy  NUMBER(1);
BEGIN
    SELECT JSON_VALUE(config, '$.hocPhiNamHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocPhiHocKy') INTO hocKy FROM DUAL;
    --     SELECT VALUE INTO namHoc FROM TC_SETTING WHERE KEY = 'hocPhiNamHoc';
--     SELECT VALUE INTO hocKy FROM TC_SETTING WHERE KEY = 'hocPhiHocKy';

    OPEN my_cur FOR
        SELECT stu.MSSV                                AS "mssv",
               (stu.HO || ' ' || stu.TEN)              AS "hoTen",
               (NDT.MA_NGANH || ': ' || NDT.TEN_NGANH) AS "nganhHoc",
               HP.CONG_NO                              AS "congNo",
               stu.NGAY_NHAP_HOC                       AS "ngayNhapHoc"
        FROM FW_STUDENT STU
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN TC_HOC_PHI HP ON HP.MSSV = STU.MSSV AND HP.NAM_HOC = namHoc AND HP.HOC_KY = hocKy
        WHERE STU.MSSV = pMssv;

    RETURN my_cur;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_INVOICE_DOWNLOAD_EXCEL( searchTerm IN STRING, filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
--     sT                 STRING(502) := '%' || lower(searchTerm) || '%';
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
                     THPTI.LY_DO_HUY              AS                   "lyDoHuy",
                     THPTI.NGAY_PHAT_HANH         AS                   "ngayPhatHanh",
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
                and THPTI.LY_DO_HUY IS NULL
--                 and ((tuNgay is null and denNgay is null) or
--                      (
--                                  IS_NUMERIC(THPT.TRANS_DATE) = 1
--                              and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
--                              and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
--                          )
--                   )
--                 and THPT.STATUS = 1
--                 AND (listBacDaoTao IS NULL OR
--                      listBacDaoTao IS NOT NULL AND
--                      FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
--                                         from dual
--                                         connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
--                 AND (listNganh IS NULL OR
--                      listNganh IS NOT NULL AND FS.MA_NGANH IN (SELECT regexp_substr(listNganh, '[^,]+', 1, level)
--                                                                from dual
--                                                                connect by regexp_substr(listNganh, '[^,]+', 1, level) is not null))
--                 AND (listKhoa IS NULL OR
--                      listKhoa IS NOT NULL AND FS.KHOA IN (SELECT regexp_substr(listKhoa, '[^,]+', 1, level)
--                                                           from dual
--                                                           connect by regexp_substr(listKhoa, '[^,]+', 1, level) is not null))
--                 AND (listLoaiHinhDaoTao IS NULL OR
--                      listLoaiHinhDaoTao IS NOT NULL AND
--                      FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
--                                               from dual
--                                               connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
-- --                 AND (nganHang IS NULL OR
-- --                      THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
-- --                                    from dual
-- --                                    connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))
--
--                 and (
--                           searchTerm = '' or
--                           LOWER(FS.HO) like sT or
--                           LOWER(NDT.TEN_NGANH) like sT or
--                           LOWER(BDT.TEN_BAC) like sT or
--                           LOWER(FS.MSSV) like sT or
--                           LOWER(FS.TEN) like sT
--                   )
                ORDER BY FS.MSSV
             );

    RETURN my_cursor;
END ;

/
--EndMethod--

