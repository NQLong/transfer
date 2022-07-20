CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor            SYS_REFCURSOR;
    sT                   STRING(502) := '%' || lower(searchTerm) || '%';
    donVi                STRING(10);
    idNamDaoTao          STRING(10);
    hocKy                STRING(1);
    bacDaoTaoFilter      STRING(10);
    loaiHinhDaoTaoFilter STRING(10);
    phongFilter          STRING(10);
    thuFilter            STRING(2);
    giangVienFilter      STRING(10);
    monHocFilter         STRING(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.idNamDaoTao') INTO idNamDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTaoFilter') INTO bacDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTaoFilter') INTO loaiHinhDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phongFilter') INTO phongFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.giangVienFilter') INTO giangVienFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.monHocFilter') INTO monHocFilter FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
             LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
             LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
             LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
                                    TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
    WHERE (TGMM.KICH_HOAT = 1)
      AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
      AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
      AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
      AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
      AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
           loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
      AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
      AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
      AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
      AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
      AND (searchTerm = ''
        OR LOWER(TRIM(DMMH.TEN)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN thoiGianPhanCong FOR
        SELECT *
        FROM (SELECT TGPC.BAT_DAU                         AS "batDau",
                     TGPC.KET_THUC                        AS "ketThuc",
                     TGPC.DON_VI                          AS "donVi",
                     DV.TEN                               AS "tenDonVi",
                     CTKDT.NAM_DAO_TAO                    AS "namDaoTao",
                     TGPC.HOC_KY                          AS "hocKy",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA)     AS "tongSoLop",

                     (SELECT COUNT(*)
                      FROM DT_THOI_KHOA_BIEU TKB
                               LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                               LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                               LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                      WHERE (TGMM.KICH_HOAT = 1)
                        AND TKB.KHOA_DANG_KY = DV.MA
                        AND (TKB.GIANG_VIEN IS NOT NULL)) AS "daPhanCong"

              FROM DT_THOI_GIAN_PHAN_CONG TGPC
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TGPC.NAM
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
                       LEFT JOIN DM_DON_VI DV ON DV.MA = TGPC.DON_VI
              WHERE (donVi IS NULL OR donVi = '' OR donVi = TGPC.DON_VI));

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT TKB.ID                AS             "id",
                     TKB.PHONG             AS             "phong",
                     TKB.THU               AS             "thu",
                     TKB.TIET_BAT_DAU      AS             "tietBatDau",
                     TKB.SO_TIET_BUOI      AS             "soTiet",
                     TKB.HOC_KY            AS             "hocKy",
                     TKB.NAM               AS             "nam",
                     TKB.MA_MON_HOC        AS             "maMonHoc",
                     TKB.NGAY_BAT_DAU      AS             "ngayBatDau",
                     TKB.NGAY_KET_THUC     AS             "ngayKetThuc",
                     TKB.LOAI_MON_HOC      AS             "loaiMonHoc",
                     TKB.NHOM              AS             "nhom",
                     TKB.SO_LUONG_DU_KIEN  AS             "soLuongDuKien",
                     DV.TEN                AS             "tenKhoaBoMon",
                     DV.MA                 AS             "maKhoaBoMon",
                     DMMH.TEN              AS             "tenMonHoc",
                     DMMH.TONG_TIET        AS             "tongTiet",
                     TKB.KHOA_DANG_KY      AS             "khoaDangKy",
                     DV1.TEN               AS             "tenKhoaDangKy",
                     CB.HO                 AS             "hoGiangVien",
                     CB.TEN                AS             "tenGiangVien",
                     TKB.GIANG_VIEN        as             "giangVien",
                     TD.VIET_TAT           AS             "trinhDo",
                     TKB.SUC_CHUA          AS             "sucChua",
                     TKB.MA_NGANH          AS             "maNganh",
                     NDT.TEN_NGANH         AS             "tenNganh",
                     TKB.BUOI              AS             "buoi",
                     TKB.IS_MO             AS             "isMo",
                     CTKDT.NAM_DAO_TAO     AS             "namDaoTao",
                     TKB.BAC_DAO_TAO       AS             "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO AS             "loaiHinhDaoTao",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on TKB.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM
                                 ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
                                    TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
              WHERE (TGMM.KICH_HOAT = 1)
                AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
                AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
                AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
                AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
                AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
                     loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
                AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
                AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
                AND (giangVienFilter IS NULL OR giangVienFilter = '' OR giangVienFilter = TKB.GIANG_VIEN)
                AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)
                AND (searchTerm = ''
                  OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT)
              ORDER BY TKB.THU, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

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
                     hcthfile.TEN          as "tenFileCongVan",
                     cbk.TRANG_THAI         as "trangThai",

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
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
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


        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
    FROM TC_HOC_PHI_TRANSACTION THPT
             LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
             LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
             LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
    where THPT.NAM_HOC = namHoc
      and THPT.STATUS = 1
      and THPT.HOC_KY = hocKy
      and ((tuNgay is null and denNgay is null) or
           (
                       IS_NUMERIC(THPT.TRANS_DATE) = 1
                   and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                   and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
               )
        )
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
      AND (nganHang IS NULL OR
           THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                         from dual
                         connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))
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
        FROM (SELECT FS.MSSV                      AS              "mssv",
                     FS.HO                        AS              "ho",
                     FS.TEN                       AS              "ten",
                     THPT.HOC_KY                  AS              "hocKy",
                     THPT.BANK                    as              "nganHang",
                     THPT.NAM_HOC                 AS              "namHoc",
                     THPT.AMOUNT                  AS              "khoanDong",
                     FS.MA_NGANH                  AS              "maNganh",
                     NDT.TEN_NGANH                AS              "tenNganh",
                     DV.TEN                       AS              "tenKhoa",
                     LHDT.TEN                     AS              "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC                  AS              "tenBacDaoTao",
                     THPT.TRANS_DATE              AS              "ngayDong",
                     THPT.STATUS                  AS              "trangThai",
                     THPTI.INVOICE_TRANSACTION_ID AS              "invoiceTransactonId",
                     THPTI.INVOICE_NUMBER         AS              "invoiceNumber",
                     THPTI.ID                     AS              "invoiceID",
                     THPT.TRANS_ID                AS              "transactionId",

                     ROW_NUMBER() OVER (ORDER BY THPT.TRANS_DATE) R
              FROM TC_HOC_PHI_TRANSACTION THPT
                       LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
                       LEFT JOIN TC_HOC_PHI_TRANSACTION_INVOICE THPTI on THPT.TRANS_ID = THPTI.TRANSACTION_ID
              where THPT.NAM_HOC = namHoc
                and THPT.HOC_KY = hocKy
                and ((tuNgay is null and denNgay is null) or
                     (
                                 IS_NUMERIC(THPT.TRANS_DATE) = 1
                             and (tuNgay is null or TO_NUMBER(THPT.TRANS_DATE) >= tuNgay)
                             and (denNgay is null or TO_NUMBER(THPT.TRANS_DATE) <= denNgay)
                         )
                  )
                and THPT.STATUS = 1
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
                AND (nganHang IS NULL OR
                     THPT.BANK IN (SELECT regexp_substr(nganHang, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(nganHang, '[^,]+', 1, level) is not null))

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

CREATE OR REPLACE FUNCTION FW_STUDENT_GET_DATA(iMssv IN STRING) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;

BEGIN
    OPEN STUDENT_INFO FOR
        SELECT STU.MSSV                                               AS "mssv",
               (STU.HO || ' ' || STU.TEN)                             AS "hoTen",
               STU.EMAIL_CA_NHAN                                      AS "emailCaNhan",
               STU.NGAY_SINH                                          AS "ngaySinh",
               (CASE WHEN STU.GIOI_TINH = 2 THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",
               TTSV.TEN                                               AS "noiSinh",
               NDT.TEN_NGANH                                          AS "tenNganh",
               STU.DIEN_THOAI_CA_NHAN                                 AS "sdt",
               TONGIAO.TEN                                            AS "tonGiao",
               QG.TEN_QUOC_GIA                                        AS "quocTich",
               DANTOC.TEN                                             AS "danToc",
               STU.DOI_TUONG_TUYEN_SINH                               AS "doiTuongTuyenSinh",
               STU.DOI_TUONG_CHINH_SACH                               AS "doiTuongChinhSach",
               STU.KHU_VUC_TUYEN_SINH                                 AS "khuVucTuyenSinh",
               PTTS.TEN                                               AS "phuongThucTuyenSinh",
               STU.DIEM_THI                                           AS "diemThi",
               STU.CMND                                               AS "cmnd",
               STU.CMND_NGAY_CAP                                      AS "cmndNgayCap",
               STU.CMND_NOI_CAP                                       AS "cmndNoiCap",
               STU.TEN_CHA                                            AS "tenCha",
               STU.NGAY_SINH_CHA                                      AS "ngaySinhCha",
               STU.NGHE_NGHIEP_CHA                                    AS "ngheNghiepCha",
               STU.SDT_CHA                                            AS "sdtCha",

               STU.TEN_ME                                             AS "tenMe",
               STU.NGAY_SINH_ME                                       AS "ngaySinhMe",
               STU.NGHE_NGHIEP_ME                                     AS "ngheNghiepMe",
               STU.SDT_ME                                             AS "sdtMe",
               STU.IMAGE                                              AS "image",
               STU.LAST_MODIFIED                                      AS "lastModified",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               STU.THUONG_TRU_SO_NHA                                  AS "soNhaThuongTru",

               xaThuongTruCha.TEN_PHUONG_XA                           as "xaThuongTruCha",
               huyenThuongTruCha.TEN_QUAN_HUYEN                       as "huyenThuongTruCha",
               tinhThuongTruCha.ten                                   as "tinhThuongTruCha",
               STU.THUONG_TRU_SO_NHA_CHA                              AS "soNhaThuongTruCha",

               xaThuongTruMe.TEN_PHUONG_XA                            as "xaThuongTruMe",
               huyenThuongTruMe.TEN_QUAN_HUYEN                        as "huyenThuongTruMe",
               tinhThuongTruMe.ten                                    as "tinhThuongTruMe",
               STU.THUONG_TRU_SO_NHA_ME                               AS "soNhaThuongTruMe",

               tinhLienLac.TEN                                        AS "tinhLienLac",
               huyenLienLac.TEN_QUAN_HUYEN                            AS "huyenLienLac",
               xaLienLac.TEN_PHUONG_XA                                AS "xaLienLac",
               STU.LIEN_LAC_SO_NHA                                    AS "soNhaLienLac",

               STU.HO_TEN_NGUOI_LIEN_LAC                              AS "hoTenNguoiLienLac",
               STU.SDT_NGUOI_LIEN_LAC                                 AS "sdtNguoiLienLac",
               STU.NGAY_VAO_DOAN                                      as "ngayVaoDoan",
               STU.NGAY_VAO_DANG                                      AS "ngayVaoDang"

        FROM FW_STUDENT STU
                 LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                 LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                 LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                 LEFT JOIN DM_TINH_THANH_PHO TTSV ON TTSV.MA = STU.NOI_SINH_MA_TINH
                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                 LEFT JOIN DM_PHUONG_THUC_TUYEN_SINH PTTS ON PTTS.MA = STU.PHUONG_THUC_TUYEN_SINH
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA


                 LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                           ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

                 LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

                 LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_TINH = xaLienLac.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_XA = tinhLienLac.MA
        WHERE STU.MSSV = iMssv;
    RETURN STUDENT_INFO;
end ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION FW_SV_SDH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       listFaculty IN STRING, listFromCity IN STRING, listEthnic IN STRING,
                                       listNationality IN STRING, listReligion IN STRING, listTinhTrangSinhVien IN STRING,
                                       gender IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM FW_SINH_VIEN_SDH STU
             LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_TICH
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.MA_KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE (
                  (listFaculty IS NOT NULL AND STU.MA_KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                   listFaculty IS NULL)
                  AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                       listFromCity IS NULL)
                  AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                  AND
                  (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_TICH) != 0 OR listNationality IS NULL)
                  AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)

                  AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                       listTinhTrangSinhVien IS NULL)
                  AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (
                 SELECT STU.MA           AS                                                       "mssv",
                        STU.HO             AS                                                     "ho",
                        STU.TEN            AS                                                     "ten",
                        STU.EMAIL  AS                                                             "emailCaNhan",
                        STU.NGAY_SINH      AS                                                     "ngaySinh",
                        STU.GIOI_TINH      AS                                                     "gioiTinh",
                        STU.DAN_TOC        AS                                                     "maDanToc",
                        STU.QUOC_TICH       AS                                                     "maQuocGia",
                        TTSV.TEN           AS                                                     "tinhTrangSinhVien",
                        STU.MA_KHOA           AS                                                     "khoa",
                        TINHTHANH.TEN      AS                                                     "tinhThanhThuongTru",
                        KHOA.TEN           AS                                                     "tenKhoa",
                        STU.MA_NGANH       AS                                                     "maNganh",
                        TONGIAO.TEN        AS                                                     "tonGiao",
                        QG.TEN_QUOC_GIA    AS                                                     "quocTich",
                        DANTOC.TEN         AS                                                     "danToc",
                        STU.NAM_TUYEN_SINH AS                                                     "namTuyenSinh",
                        ROW_NUMBER() OVER (ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN ) R
                 FROM FW_SINH_VIEN_SDH STU
                          LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
                          LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_TICH
                          LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                          LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                          LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
                          LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.MA_KHOA
                          LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                 WHERE (
                         (listFaculty IS NOT NULL AND STU.MA_KHOA IN (SELECT regexp_substr(listFaculty, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null) OR
                           listFaculty IS NULL)
                          AND (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0 OR
                               listFromCity IS NULL)
                          AND (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0 OR listEthnic IS NULL)
                          AND
                          (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_TICH) != 0 OR listNationality IS NULL)
                          AND (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0 OR listReligion IS NULL)

                          AND (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0 OR
                               listTinhTrangSinhVien IS NULL)
                          AND (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender OR gender IS NULL))
                   AND (searchTerm = ''
                     OR LOWER(STU.MA) LIKE sT
                     OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                     OR LOWER(STU.MA_NGANH) LIKE sT
                     OR LOWER(STU.SDT_CA_NHAN) LIKE sT
                     OR LOWER(STU.SDT_LIEN_HE) LIKE sT
                     OR LOWER(STU.EMAIL) LIKE sT)
                 ORDER BY STU.NAM_TUYEN_SINH DESC NULLS LAST, STU.TEN
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN STUDENT_INFO;
end;

/
--EndMethod--
