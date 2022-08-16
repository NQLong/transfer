CREATE OR REPLACE FUNCTION DV_WEBSITE_SEARCH_PAGE_DON_VI(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, maDonVi IN STRING,
                                              searchTerm IN STRING, totalItem OUT NUMBER,
                                              pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DV_WEBSITE WS
    WHERE (searchTerm = '' OR lower(WS.SHORTNAME) LIKE sT OR lower(WS.WEBSITE) LIKE sT)
      AND (maDonVi = '' OR maDonVi IS NULL
        OR maDonVi LIKE WS.MA_DON_VI);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT WS.ID        AS                    "id",
                        WS.SHORTNAME AS                    "shortname",
                        WS.KICH_HOAT AS                    "kichHoat",
                        WS.MA_DON_VI AS                    "maDonVi",
                        DDV.TEN      AS                    "tenDonVi",
                        WS.WEBSITE   AS                    "website",
                        ROW_NUMBER() OVER (ORDER BY WS.ID) R
                 FROM DV_WEBSITE WS
                          LEFT JOIN DM_DON_VI DDV on WS.MA_DON_VI = DDV.MA
                 WHERE (searchTerm = '' OR lower(WS.SHORTNAME) LIKE sT OR lower(WS.WEBSITE) LIKE sT)
                   AND (maDonVi = ''
                     OR maDonVi IS NULL
                     OR maDonVi LIKE WS.MA_DON_VI)
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_DOWNLOAD_PSC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    OPEN my_cursor FOR
        SELECT FS.MSSV          AS                          "mssv",
               FS.HO            AS                          "ho",
               FS.TEN           AS                          "ten",
               THPT.HOC_KY      AS                          "hocKy",
               THPT.BANK        as                          "nganHang",
               THPT.NAM_HOC     AS                          "namHoc",
               THPT.AMOUNT      AS                          "khoanDong",
               FS.MA_NGANH      AS                          "maNganh",
               NDT.TEN_NGANH    AS                          "tenNganh",
               DV.TEN           AS                          "tenKhoa",
               LHDT.TEN         AS                          "tenLoaiHinhDaoTao",
               BDT.TEN_BAC      AS                          "tenBacDaoTao",
               THPT.TRANS_DATE  AS                          "ngayDong",
               FS.NAM_TUYEN_SINH AS                          "namTuyenSinh",

               ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE) R
        FROM TC_HOC_PHI_TRANSACTION THPT
                 LEFT JOIN FW_STUDENT FS
                           on THPT.CUSTOMER_ID = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
        where THPT.NAM_HOC = namHoc
          and THPT.HOC_KY = hocKy
          and THPT.STATUS = 1;

    RETURN my_cursor;
END ;

/
--EndMethod--