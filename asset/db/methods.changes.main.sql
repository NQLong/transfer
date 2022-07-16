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
             LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
    WHERE (TGMM.KICH_HOAT = 1)
      AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
      AND (idNamDaoTao IS NULL OR idNamDaoTao = '' OR idNamDaoTao = TKB.NAM)
      AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
      AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
      AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
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
        FROM (SELECT FS.MSSV         AS                  "mssv",
                     FS.HO           AS                  "ho",
                     FS.TEN          AS                  "ten",
                     THPT.HOC_KY     AS                  "hocKy",
                     THPT.BANK       as                  "nganHang",
                     THPT.NAM_HOC    AS                  "namHoc",
                     THPT.AMOUNT     AS                  "khoanDong",
                     FS.MA_NGANH     AS                  "maNganh",
                     NDT.TEN_NGANH   AS                  "tenNganh",
                     DV.TEN          AS                  "tenKhoa",
                     LHDT.TEN        AS                  "tenLoaiHinhDaoTao",
                     BDT.TEN_BAC     AS                  "tenBacDaoTao",
                     THPT.TRANS_DATE AS                  "ngayDong",
                     THPT.STATUS     AS                  "trangThai",

                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI_TRANSACTION THPT
                       LEFT JOIN FW_STUDENT FS on THPT.CUSTOMER_ID = FS.MSSV
                       LEFT JOIN DT_NGANH_DAO_TAO NDT on FS.MA_NGANH = NDT.MA_NGANH
                       LEFT JOIN DM_DON_VI DV ON DV.MA = NDT.KHOA
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON FS.LOAI_HINH_DAO_TAO = LHDT.MA
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT on BDT.MA_BAC = FS.BAC_DAO_TAO
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
              ORDER BY THPT.TRANS_DATE
             )


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

CREATE OR REPLACE function TC_HOC_PHI_TRANSACTION_LIST_BANK(searchTerm in NVARCHAR2) RETURN SYS_REFCURSOR
AS my_cursor          SYS_REFCURSOR;
    sT                 STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    OPEN my_cursor FOR
        SELECT DISTINCT BANK as "bank" from TC_HOC_PHI_TRANSACTION where BANK is not null and (searchTerm = '' or LOWER(BANK) like sT);
    RETURN my_cursor;
END;

/
--EndMethod--

