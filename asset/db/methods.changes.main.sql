CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_GET_FREE(config IN STRING, hocPhanTheoIdNganh OUT SYS_REFCURSOR,
                                           hocPhanDaXep OUT SYS_REFCURSOR, currentStatusRoom OUT SYS_REFCURSOR)
    RETURN SYS_REFCURSOR
AS
    my_cursor  SYS_REFCURSOR;
    khoaDangKy STRING(500);
    bac        STRING(10);
    he         STRING(10);
    khoaSv     STRING(4);
    namHoc     STRING(100);
    hocKy      STRING(1);
    now        STRING(20);
--     listIdHocPhan STRING(500);
begin
    SELECT JSON_VALUE(config, '$.khoaDangKy') INTO khoaDangKy FROM DUAL;
    SELECT JSON_VALUE(config, '$.bacDaoTao') INTO bac FROM DUAL;
    SELECT JSON_VALUE(config, '$.loaiHinhDaoTao') INTO he FROM DUAL;
    SELECT JSON_VALUE(config, '$.khoaSinhVien') INTO khoaSv FROM DUAL;
    SELECT JSON_VALUE(config, '$.nam') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(config, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(config, '$.now') INTO now FROM DUAL;

    --     SELECT LISTAGG(TMP.ID_THOI_KHOA_BIEU, ',') WITHIN GROUP (ORDER BY TMP.ID_THOI_KHOA_BIEU)
--     INTO listIdHocPhan
--     FROM (SELECT DISTINCT TKBN.ID_THOI_KHOA_BIEU
--           FROM DT_THOI_KHOA_BIEU_NGANH TKBN
--           WHERE TKBN.ID_NGANH IN
--                 (SELECT regexp_substr(khoaDangKy, '[^,]+', 1, level)
--                  from dual
--                  connect by regexp_substr(khoaDangKy, '[^,]+', 1, level) is not null)) TMP;

    open hocPhanTheoIdNganh FOR
        SELECT DISTINCT TKBN.ID_NGANH                         AS "idNganh",
                        (SELECT LISTAGG(DTTKB.ID, ',') WITHIN GROUP (ORDER BY DTTKB.ID)
                         FROM DT_THOI_KHOA_BIEU DTTKB
                                  LEFT JOIN DT_THOI_KHOA_BIEU_NGANH DTTKBN ON DTTKB.ID = DTTKBN.ID_THOI_KHOA_BIEU
                         WHERE DTTKBN.ID_NGANH = TKBN.ID_NGANH
                           AND TKB.IS_MO = 1
                           AND TKB.BAC_DAO_TAO = bac
                           AND TKB.LOAI_HINH_DAO_TAO = he
                           AND TKB.KHOA_SINH_VIEN = khoaSv
                           AND TKB.NAM = namHoc
                           AND TKB.HOC_KY = hocKy
                           AND TKB.LOAI_MON_HOC IS NULL
                           AND TKB.KHOA_DANG_KY = khoaDangKy) AS "idThoiKhoaBieu"
        FROM DT_THOI_KHOA_BIEU_NGANH TKBN
                 LEFT JOIN DT_THOI_KHOA_BIEU TKB ON TKB.ID = TKBN.ID_THOI_KHOA_BIEU
        WHERE TKB.IS_MO = 1
          AND TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy
          AND TKB.KHOA_DANG_KY = khoaDangKy
          AND TKB.LOAI_MON_HOC IS NULL;
    --           AND TKBN.ID_NGANH IN (SELECT regexp_substr(khoaDangKy, '[^,]+', 1, level)
--                                 from dual
--                                 connect by regexp_substr(khoaDangKy, '[^,]+', 1, level) is not null);
    open hocPhanDaXep FOR
        SELECT TKB.ID                                  AS "id",
               TKB.MA_MON_HOC                          AS "maMonHoc",
               TKB.THU                                 AS "thu",
               TKB.TIET_BAT_DAU                        AS "tietBatDau",
               TKB.SO_TIET_BUOI                        AS "soTietBuoi",
               TKB.TIET_BAT_DAU + TKB.SO_TIET_BUOI - 1 AS "tietKetThuc"
        FROM DT_THOI_KHOA_BIEU TKB
        WHERE TKB.THU IS NOT NULL
          AND TKB.TIET_BAT_DAU IS NOT NULL
          AND TKB.PHONG IS NOT NULL
          AND TKB.KHOA_DANG_KY = khoaDangKy
          AND TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.IS_MO = 1
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.NAM = namHoc
          AND TKB.LOAI_MON_HOC IS NULL
          AND TKB.HOC_KY = hocKy;
    --    AND TKB.ID IN (SELECT regexp_substr(listIdHocPhan, '[^,]+', 1, level)
--                          from dual
--                          connect by regexp_substr(listIdHocPhan, '[^,]+', 1, level) is not null);
    open currentStatusRoom for
        select
            TKB.PHONG AS "phong",
            TKB.THU AS "thu",
            TKB.TIET_BAT_DAU AS "tietBatDau",
            TKB.SO_TIET_BUOI AS "soTietBuoi"
        from  DT_THOI_KHOA_BIEU TKB
        WHERE TKB.PHONG IS NOT NULL
          AND TKB.THU IS NOT NULL
          AND TKB.TIET_BAT_DAU IS NOT NULL
          AND TKB.IS_MO = 1
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy;
    open my_cursor for
        select TKB.ID                AS "id",
               TKB.MA_MON_HOC        AS "maMonHoc",
               TKB.BAC_DAO_TAO       AS "bacDaoTao",
               TKB.SO_TIET_BUOI      AS "soTietBuoi",
               TKB.LOAI_HINH_DAO_TAO AS "loaiHinhDaoTao",
               TKB.NHOM              AS "nhom",
               TKB.LOAI_MON_HOC      AS "loaiMonHoc",
               TKB.SO_LUONG_DU_KIEN  AS "soLuongDuKien",
               TKB.SO_TIET_LY_THUYET AS "soTietLyThuyet",
               TKB.TIET_BAT_DAU      AS "tietBatDau",
               TKB.SO_BUOI_TUAN      AS "soBuoiTuan",
               TKB.SO_TIET_THUC_HANH AS "soTietThucHanh"
        From DT_THOI_KHOA_BIEU TKB
        WHERE TKB.BAC_DAO_TAO = bac
          AND TKB.LOAI_HINH_DAO_TAO = he
          AND TKB.PHONG IS NULL
          AND TKB.KHOA_SINH_VIEN = khoaSv
          AND TKB.IS_MO = 1
          AND TKB.NAM = namHoc
          AND TKB.HOC_KY = hocKy
          AND TKB.KHOA_DANG_KY = khoaDangKy
--     AND TKB.ID IN (SELECT regexp_substr(listIdHocPhan, '[^,]+', 1, level)
--                          from dual
--                          connect by regexp_substr(listIdHocPhan, '[^,]+', 1, level) is not null);
        ORDER BY TKB.SO_TIET_BUOI DESC;
    return my_cursor;
end;

/
--EndMethod--

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
--              LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
--                                     TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
    WHERE
--         (TGMM.KICH_HOAT = 1)AND
        (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
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
        FROM (SELECT TKB.ID                   AS          "id",
                     TKB.PHONG                AS          "phong",
                     TKB.THU                  AS          "thu",
                     TKB.TIET_BAT_DAU         AS          "tietBatDau",
                     TKB.SO_TIET_BUOI         AS          "soTiet",
                     TKB.HOC_KY               AS          "hocKy",
                     TKB.NAM                  AS          "nam",
                     TKB.MA_MON_HOC           AS          "maMonHoc",
                     TKB.NGAY_BAT_DAU         AS          "ngayBatDau",
                     TKB.NGAY_KET_THUC        AS          "ngayKetThuc",
                     TKB.LOAI_MON_HOC         AS          "loaiMonHoc",
                     TKB.NHOM                 AS          "nhom",
                     TKB.SO_LUONG_DU_KIEN     AS          "soLuongDuKien",
                     DV.TEN                   AS          "tenKhoaBoMon",
                     DV.MA                    AS          "maKhoaBoMon",
                     DMMH.TEN                 AS          "tenMonHoc",
                     DMMH.TONG_TIET           AS          "tongTiet",
                     TKB.KHOA_DANG_KY         AS          "khoaDangKy",
                     DV1.TEN                  AS          "tenKhoaDangKy",
                     CB.HO                    AS          "hoGiangVien",
                     CB.TEN                   AS          "tenGiangVien",
                     TKB.GIANG_VIEN           as          "giangVien",
                     TD.VIET_TAT              AS          "trinhDo",
                     TKB.SUC_CHUA             AS          "sucChua",
                     TKB.BUOI                 AS          "buoi",
                     TKB.IS_MO                AS          "isMo",
                     CTKDT.NAM_DAO_TAO        AS          "namDaoTao",
                     TKB.BAC_DAO_TAO          AS          "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO    AS          "loaiHinhDaoTao",
                     (SELECT LISTAGG(sNDT.MA_NGANH, ',') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "maNganh",

                     (SELECT LISTAGG((TO_CHAR(sNDT.MA_NGANH) || '%' || sNDT.TEN_NGANH), '&&') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               INNER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "tenNganh",

                     (SELECT LISTAGG(TO_CHAR(sCN.NGANH) || '%' || sCN.TEN, '&&') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                               INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                          ON (sCN.NGANH || '##' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "tenChuyenNganh",

                     (SELECT LISTAGG(sCN.ID, ',') WITHIN GROUP (
                         order by sTKB.ID
                         )
                      FROM DT_THOI_KHOA_BIEU sTKB
                               INNER JOIN DT_THOI_KHOA_BIEU_NGANH sTKBN ON sTKB.ID = sTKBN.ID_THOI_KHOA_BIEU
                               LEFT OUTER JOIN DT_NGANH_DAO_TAO sNDT ON sNDT.MA_NGANH = sTKBN.ID_NGANH
                               INNER JOIN DT_DANH_SACH_CHUYEN_NGANH sCN
                                          ON (sCN.NGANH || '##' || TO_CHAR(sCN.ID)) = sTKBN.ID_NGANH
                      WHERE sTKB.ID = TKB.ID) AS          "maChuyenNganh",

--                      NDT.TEN_NGANH         AS             "tenNganh",
--                      CN.TEN                AS             "tenChuyenNganh",
                     TKB.KHOA_SINH_VIEN       AS          "khoaSinhVien",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                       LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                       LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
--                        LEFT JOIN DT_THOI_KHOA_BIEU_NGANH TKBN ON TKB.ID = TKBN.ID_THOI_KHOA_BIEU
--                        LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = TKBN.ID_NGANH
--                        LEFT OUTER JOIN DT_DANH_SACH_CHUYEN_NGANH CN ON (CN.NGANH + '&&' + TO_CHAR(CN.ID)) = TKBN.ID_NGANH


--                        LEFT JOIN DT_THOI_GIAN_MO_MON TGMM
--                                  ON TGMM.NAM = CTKDT.ID AND TGMM.BAC_DAO_TAO = TKB.BAC_DAO_TAO AND
--                                     TGMM.LOAI_HINH_DAO_TAO = TKB.LOAI_HINH_DAO_TAO
              WHERE
--                   (TGMM.KICH_HOAT = 1) AND
                  (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
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
              ORDER BY TKB.THU NULLS FIRST, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--