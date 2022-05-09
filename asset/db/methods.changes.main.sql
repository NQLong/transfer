CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, donVi IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
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
        FROM (SELECT TKB.ID               AS              "id",
                     TKB.PHONG            AS              "phong",
                     TKB.THU              AS              "thu",
                     TKB.TIET_BAT_DAU     AS              "tietBatDau",
                     TKB.SO_TIET          AS              "soTiet",
                     TKB.HOC_KY           AS              "hocKy",
                     TKB.NAM              AS              "nam",
                     TKB.MA_MON_HOC       AS              "maMonHoc",
                     TKB.NGAY_BAT_DAU     AS              "ngayBatDau",
                     TKB.NGAY_KET_THUC    AS              "ngayKetThuc",
                     TKB.NHOM             AS              "nhom",
                     TKB.SO_LUONG_DU_KIEN AS              "soLuongDuKien",
                     DV.TEN               AS              "tenKhoaBoMon",
                     DV.MA                AS              "maKhoaBoMon",
                     DMMH.TEN             AS              "tenMonHoc",
                     DMMH.TONG_TIET       AS              "tongTiet",
                     TKB.KHOA_DANG_KY     AS              "khoaDangKy",
                     DV1.TEN              AS              "tenKhoaDangKy",
                     CB.HO                AS              "hoGiangVien",
                     CB.TEN               AS              "tenGiangVien",
                     TKB.GIANG_VIEN       as              "giangVien",
                     TD.VIET_TAT          AS              "trinhDo",
                     TKB.SUC_CHUA         AS              "sucChua",
                     TKB.MA_NGANH         AS              "maNganh",
                     NDT.TEN_NGANH        AS              "tenNganh",
                     TKB.BUOI             AS              "buoi",
                     TKB.IS_MO            AS              "isMo",
                     CTKDT.NAM_DAO_TAO    AS              "namDaoTao",
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
                       LEFT JOIN DT_THOI_GIAN_MO_MON TGMM ON TGMM.NAM = CTKDT.ID
              WHERE (TGMM.KICH_HOAT = 1)
                AND (donVi IS NULL OR donVi = '' OR donVi = TKB.KHOA_DANG_KY)
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

