CREATE OR REPLACE FUNCTION DM_DON_VI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_DON_VI dv
             LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
    WHERE searchTerm = ''
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT dv.MA               AS                     "ma",
                        dv.TEN              AS                     "ten",
                        dv.TEN_TIENG_ANH    AS                     "tenTiengAnh",
                        dv.TEN_VIET_TAT     AS                     "tenVietTat",
                        dv.QD_THANH_LAP     AS                     "qdThanhLap",
                        dv.QD_XOA_TEN       AS                     "qdXoaTen",
                        dv.MA_PL            AS                     "maPl",
                        ldv.TEN             AS                     "tenLoaiDonVi",
                        dv.GHI_CHU          AS                     "ghiChu",
                        dv.KICH_HOAT        AS                     "kichHoat",
                        dv.DUONG_DAN        AS                     "duongDan",
                        dv.IMAGE            AS                     "image",
                        dv.IMAGE_DISPLAY    AS                     "imageDisplay",
                        dv.IMAGE_DISPLAY_TA AS                     "imageDisplayTa",
                        dv.PRE_SHCC         AS                     "preShcc",
                        dv.HOME_LANGUAGE    as                     "homeLanguage",
                        ROW_NUMBER() OVER (ORDER BY MA_PL, dv.TEN) R
                 FROM DM_DON_VI dv
                          LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
                 WHERE searchTerm = ''
                    OR LOWER(TRIM(dv.TEN)) LIKE sT
                    OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DT_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             searchTerm IN STRING, filter IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(502) := '%' || lower(searchTerm) || '%';
    donVi              STRING(10);
    namDaoTao          NUMBER(4);
    listLoaiHinhDaoTao STRING(50);
BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namDaoTao') INTO namDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_KHUNG_DAO_TAO KDT
             LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
             LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

    WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           KDT.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
        OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
        OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT)
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
                     DNDT.TEN_NGANH        AS                          "tenNganh",
                     BDT.TEN_BAC           AS                          "trinhDoDaoTao",
                     LHDT.TEN              AS                          "loaiHinhDaoTao",
                     KDT.THOI_GIAN_DAO_TAO AS                          "thoiGianDaoTao",
                     DV.TEN                AS                          "tenKhoaBoMon",
                     CN.TEN                AS                          "tenChuyenNganh",
                     ROW_NUMBER() OVER (ORDER BY KDT.NAM_DAO_TAO DESC) R
              FROM DT_KHUNG_DAO_TAO KDT
                       LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON CN.ID = KDT.CHUYEN_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = KDT.MA_KHOA
                       LEFT JOIN DT_NGANH_DAO_TAO DNDT on KDT.MA_NGANH = DNDT.MA_NGANH
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO KHUNG ON KHUNG.ID = KDT.NAM_DAO_TAO

                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = KDT.TRINH_DO_DAO_TAO
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = KDT.LOAI_HINH_DAO_TAO
              WHERE (donVi IS NULL OR donVi = '' OR TO_NUMBER(donVi) = KDT.MA_KHOA)
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     KDT.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(TRIM(DNDT.MA_NGANH)) LIKE sT
                  OR LOWER(TRIM(DNDT.TEN_NGANH)) LIKE sT
                  OR LOWER(TRIM(KDT.NAM_DAO_TAO)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT)
                AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO)
              ORDER BY KDT.NAM_DAO_TAO DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

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
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.daDong') INTO daDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNganh') INTO listNganh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoa') INTO listKhoa FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
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
        AND (NAM_HOC = namHoc AND HOC_KY = hocKy)
        AND (searchTerm = ''
            OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT)
       OR FS.MSSV LIKE ST;

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
        FROM (SELECT HP.MSSV                             AS "mssv",
                     HP.NAM_HOC                          AS "namHoc",
                     HP.HOC_KY                           AS "hocKy",
                     HP.CONG_NO                          AS "congNo",
                     HP.HOC_PHI                          AS "hocPhi",
                     (FS.HO || ' ' || FS.TEN)            AS "hoTenSinhVien",
                     FS.DIEN_THOAI_CA_NHAN               AS "soDienThoai",
                     FS.EMAIL_CA_NHAN                    AS "emailCaNhan",
                     FS.MA_NGANH                         AS "maNganh",
                     NDT.TEN_NGANH                       AS "tenNganh",
                     DV.TEN                              AS "tenKhoa",
                     LHDT.TEN                            AS "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC                         AS "tenBac",
                     (SELECT MAX(TRANS_DATE)
                      FROM TC_HOC_PHI_TRANSACTION TRANS
                      WHERE HP.HOC_KY = TRANS.HOC_KY
                        AND HP.NAM_HOC = TRANS.NAM_HOC
                        AND HP.MSSV = TRANS.CUSTOMER_ID) AS "lastTransaction",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN)    R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
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
                     listBacDaoTao IS NOT NULL AND
                     FS.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     FS.LOAI_HINH_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
                AND (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT
                  OR FS.MSSV LIKE ST))


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION DV_WEBSITE_SEARCH_PAGE_DON_VI(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, maDonVi IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DV_WEBSITE WS
    WHERE maDonVi = '' OR maDonVi IS NULL
       OR maDonVi LIKE WS.MA_DON_VI;

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
                 WHERE maDonVi = '' OR maDonVi IS NULL
                    OR maDonVi LIKE WS.MA_DON_VI
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

