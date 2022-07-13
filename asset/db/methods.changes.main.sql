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

CREATE OR REPLACE FUNCTION DT_DANG_KY_MO_MON_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              donVi IN STRING, searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_DANG_KY_MO_MON dtDangKyMoMon
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
             LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA

    WHERE (donVi IS NULL OR donVi = dmDv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT dtDangKyMoMon.KHOA      as            "khoa",
                     dtDangKyMoMon.HOC_KY    as            "hocKy",
                     CT.NAM_DAO_TAO          as            "namHoc",
                     dtDangKyMoMon.THOI_GIAN as            "thoiGian",
                     dtDangKyMoMon.GHI_CHU   as            "ghiChu",
                     dtDangKyMoMon.ID        as            "id",
                     dtDangKyMoMon.IS_DUYET  as            "isDuyet",
                     dmDv.TEN                as            "tenKhoaBoMon",
                     dtDangKyMoMon.MA_NGANH  as            "maNganh",
                     ds.TEN_NGANH            as            "tenNganh",
                     bdt.MA_BAC              as            "bacDaoTao",
                     bdt.TEN_BAC             as            "tenBacDaoTao",
                     lhdt.MA                 as            "loaiHinhDaoTao",
                     lhdt.TEN                as            "tenLoaiHinhDaoTao",
                     ROW_NUMBER() OVER (ORDER BY dmDv.TEN) R
              FROM DT_DANG_KY_MO_MON dtDangKyMoMon
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
                       LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA
                       LEFT JOIN DM_SV_BAC_DAO_TAO bdt ON bdt.MA_BAC = dtDangKyMoMon.BAC_DAO_TAO
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO lhdt ON lhdt.MA = dtDangKyMoMon.LOAI_HINH_DAO_TAO
                       LEFT JOIN DT_NGANH_DAO_TAO ds ON ds.MA_NGANH = dtDangKyMoMon.MA_NGANH
              WHERE (donVi IS NULL OR donVi = dmDv.MA))
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
    heDaoTaoFilter     STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.namDaoTao') INTO namDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.heDaoTaoFilter') INTO heDaoTaoFilter FROM DUAL;

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
      AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.LOAI_HINH_DAO_TAO)
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
                AND (heDaoTaoFilter IS NULL OR heDaoTaoFilter = '' OR heDaoTaoFilter = KDT.LOAI_HINH_DAO_TAO)
                AND (namDaoTao IS NULL OR namDaoTao = '' OR TO_NUMBER(namDaoTao) = KDT.NAM_DAO_TAO)
              ORDER BY KDT.NAM_DAO_TAO DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    shccCanBo IN STRING,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_TRINH_KY cvtk
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
             LEFT JOIN HCTH_CAN_BO_KY cbk on cvtk.ID = cbk.CONG_VAN_TRINH_KY
    where (
                      cvtk.NGUOI_TAO = shccCanBo
                  OR cbk.NGUOI_KY = shccCanBo
              );
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cvtk.ID               as "id",
                     cvtk.FILE_CONG_VAN    as "congVanId",
                     cvtk.NGUOI_TAO        as "nguoiTao",
                     cvtk.THOI_GIAN        as "thoiGian",
                     cbt.HO                as "hoNguoiTao",
                     cbt.TEN               as "tenNguoiTao",
                     hcthcvd.TRICH_YEU     as "trichYeu",
                     hcthcvd.LOAI_CONG_VAN as "loaiCongVan",
                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cb.HO IS NULL THEN cb.TEN
                                         WHEN cb.TEN IS NULL THEN cb.HO
                                         ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                                         END,
                                     ';'
                                 ) WITHIN GROUP (
                                         order by cb.TEN
                                         ) as "hoVaTenCanBo"
                      FROM HCTH_CAN_BO_KY cbk
                               LEFT JOIN TCHC_CAN_BO cb on cbk.NGUOI_KY = cb.SHCC
                      where cbk.CONG_VAN_TRINH_KY = cvtk.id
                     )                     as "danhSachCanBoKy",

                     ROW_NUMBER() OVER (
                         ORDER BY cvtk.ID DESC
                         )                    R
              FROM HCTH_CONG_VAN_TRINH_KY cvtk
                       LEFT JOIN TCHC_CAN_BO cbt on cbt.SHCC = cvtk.NGUOI_TAO
                       LEFT JOIN HCTH_FILE hcthfile on hcthfile.LOAI = 'DI' and hcthfile.ID = cvtk.FILE_CONG_VAN
                       LEFT JOIN HCTH_CONG_VAN_DI hcthcvd on hcthcvd.ID = hcthfile.MA
                       LEFT JOIN HCTH_CAN_BO_KY cbk on cvtk.ID = cbk.CONG_VAN_TRINH_KY
              WHERE
-- check if user is related to congVanTrinhKy
(
            cvtk.NGUOI_TAO = shccCanBo
        OR cbk.NGUOI_KY = shccCanBo
    ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

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

CREATE OR REPLACE FUNCTION TC_HOC_PHI_DOWNLOAD_PSC(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;


    OPEN my_cursor FOR
        SELECT HP.MSSV                                                  AS                            "mssv",
               HP.NAM_HOC                                               AS                            "namHoc",
               HP.HOC_KY                                                AS                            "hocKy",
               HP.CONG_NO                                               AS                            "congNo",
               HP.HOC_PHI                                               AS                            "hocPhi",
               FS.HO                                                    as                            "ho",
               FS.TEN                                                   AS                            "ten",
               FS.GIOI_TINH                                             AS                            "gioiTinh",
               FS.NGAY_SINH                                             AS                            "ngaySinh",
               (FS.HO || ' ' || FS.TEN)                                 AS                            "hoTenSinhVien",
               FS.DIEN_THOAI_CA_NHAN                                    AS                            "soDienThoai",
               FS.EMAIL_CA_NHAN                                         AS                            "emailCaNhan",
               FS.MA_NGANH                                              AS                            "maNganh",
               NDT.TEN_NGANH                                            AS                            "tenNganh",
               DV.TEN                                                   AS                            "tenKhoa",
               LHDT.TEN                                                 AS                            "tenLoaiHinhDaoTao",
               BDT.TEN_BAC                                              AS                            "tenBacDaoTao",
               (SELECT TRANS_DATE
                FROM TC_HOC_PHI_TRANSACTION
                WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                    FROM TC_HOC_PHI_TRANSACTION TRANS
                                    WHERE HP.HOC_KY = TRANS.HOC_KY
                                      AND HP.NAM_HOC = TRANS.NAM_HOC
                                      AND HP.MSSV = TRANS.CUSTOMER_ID)) AS                            "lastTransaction",

               (SELECT TRANS_ID
                FROM TC_HOC_PHI_TRANSACTION
                WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                    FROM TC_HOC_PHI_TRANSACTION TRANS
                                    WHERE HP.HOC_KY = TRANS.HOC_KY
                                      AND HP.NAM_HOC = TRANS.NAM_HOC
                                      AND HP.MSSV = TRANS.CUSTOMER_ID)) AS                            "lastTransactionId",
               ROW_NUMBER() OVER (ORDER BY (SELECT TRANS_DATE
                                            FROM TC_HOC_PHI_TRANSACTION
                                            WHERE TRANS_DATE = (SELECT MAX(TRANS_DATE)
                                                                FROM TC_HOC_PHI_TRANSACTION TRANS
                                                                WHERE HP.HOC_KY = TRANS.HOC_KY
                                                                  AND HP.NAM_HOC = TRANS.NAM_HOC
                                                                  AND HP.MSSV = TRANS.CUSTOMER_ID)) ) R
        FROM TC_HOC_PHI HP
                 LEFT JOIN FW_STUDENT FS
                           on HP.MSSV = FS.MSSV
                 LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                 LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
        WHERE (NAM_HOC = namHoc
            AND HOC_KY = hocKy
            AND EXISTS(SELECT TRANS_ID
                       FROM TC_HOC_PHI_TRANSACTION TRANS
                       WHERE HP.HOC_KY = TRANS.HOC_KY
                         AND HP.NAM_HOC = TRANS.NAM_HOC
                         AND HP.MSSV = TRANS.CUSTOMER_ID
                         AND TRANS.STATUS = 1
                   )
                  );
    RETURN my_cursor;
END ;

/
--EndMethod--

