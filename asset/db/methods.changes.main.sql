CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                              thoiGianPhanCong OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    my_cursor            SYS_REFCURSOR;
    sT                   STRING(502) := '%' || lower(searchTerm) || '%';
    donVi                STRING(10);
    namFilter            STRING(10);
    hocKy                STRING(1);
    bacDaoTaoFilter      STRING(10);
    khoaSinhVienFilter   STRING(4);
    loaiHinhDaoTaoFilter STRING(10);
    phongFilter          STRING(10);
    thuFilter            STRING(2);
    monHocFilter         STRING(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.namFilter') INTO namFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.bacDaoTaoFilter') INTO bacDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHinhDaoTaoFilter') INTO loaiHinhDaoTaoFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.khoaSinhVienFilter') INTO khoaSinhVienFilter FROM DUAL;

    SELECT JSON_VALUE(filter, '$.donVi') INTO donVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.phongFilter') INTO phongFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.thuFilter') INTO thuFilter FROM DUAL;
    SELECT JSON_VALUE(filter, '$.monHocFilter') INTO monHocFilter FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU                          ID,
                               LISTAGG(GV.GIANG_VIEN || '_' || TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                                       WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTGV
                        FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                 LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                 LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                        WHERE TYPE = 'GV'
                        GROUP BY GV.ID_THOI_KHOA_BIEU
                        ORDER BY GV.ID_THOI_KHOA_BIEU) LISTGV on LISTGV.ID = TKB.ID
             LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU                          ID,
                               LISTAGG(GV.GIANG_VIEN || '_' || TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                                       WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTTG
                        FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                 LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                 LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                        WHERE TYPE = 'TG'
                        GROUP BY GV.ID_THOI_KHOA_BIEU
                        ORDER BY GV.ID_THOI_KHOA_BIEU) LISTTG on LISTTG.ID = TKB.ID
             LEFT JOIN (SELECT LISTAGG(sTKBN.ID_NGANH, ',') WITHIN GROUP (ORDER BY NULL) AS ID_NGANH,
                               sTKBN.ID_THOI_KHOA_BIEU,
                               LISTAGG(NDT.KHOA, ',') WITHIN GROUP (ORDER BY NULL)       AS KHOA_NGANH,
                               LISTAGG(DSCN.KHOA, ',') WITHIN GROUP (ORDER BY NULL)      AS KHOA_CN
                        FROM DT_THOI_KHOA_BIEU_NGANH sTKBN
                                 LEFT JOIN DT_THOI_KHOA_BIEU sTKB ON sTKBN.ID_THOI_KHOA_BIEU = sTKB.ID
                                 LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH IN sTKBN.ID_NGANH
                                 LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH DSCN
                                           ON (DSCN.NGANH || '##' || DSCN.ID) IN sTKBN.ID_NGANH
                        GROUP BY sTKBN.ID_THOI_KHOA_BIEU) TKBN ON TKBN.ID_THOI_KHOA_BIEU = TKB.ID

    WHERE (khoaSinhVienFilter IS NULL OR khoaSinhVienFilter = '' OR TKB.KHOA_SINH_VIEN = khoaSinhVienFilter)
      AND (namFilter IS NULL OR namFilter = '' OR namFilter = TKB.NAM)
      AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
      AND (donVi IS NULL OR donVi = '' OR donVi IN (SELECT regexp_substr(TKBN.KHOA_NGANH, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(TKBN.KHOA_NGANH, '[^,]+', 1, level) is not null)
        OR donVi IN (SELECT regexp_substr(TKBN.KHOA_CN, '[^,]+', 1, level)
                     from dual
                     connect by regexp_substr(TKBN.KHOA_CN, '[^,]+', 1, level) is not null)
        )
      AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
      AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
           loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
      AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
      AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
      AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)

      AND (searchTerm = ''
        OR LOWER(TRIM(DMMH.TEN)) LIKE sT
        OR LOWER(TRIM(DV.TEN)) LIKE sT
        OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
        OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
        OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
        OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm));

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
                     TKB.GIANG_VIEN           as          "giangVien",
                     TKB.SUC_CHUA             AS          "sucChua",
                     TKB.BUOI                 AS          "buoi",
                     TKB.IS_MO                AS          "isMo",
                     CTKDT.NAM_DAO_TAO        AS          "namDaoTao",
                     TKB.BAC_DAO_TAO          AS          "bacDaoTao",
                     TKB.LOAI_HINH_DAO_TAO    AS          "loaiHinhDaoTao",
                     LISTGV.LISTGV            AS          "listGiangVien",
                     LISTTG.LISTTG            AS          "listTroGiang",
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

                     TKB.KHOA_SINH_VIEN       AS          "khoaSinhVien",
                     ROW_NUMBER() OVER (ORDER BY TKB.THU) R
              FROM DT_THOI_KHOA_BIEU TKB
                       LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CTKDT ON CTKDT.ID = TKB.NAM
                       LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                       LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                       LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                       LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU                          ID,
                                         LISTAGG(GV.GIANG_VIEN || '_' || TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                                                 WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTGV
                                  FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                           LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                           LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                  WHERE TYPE = 'GV'
                                  GROUP BY GV.ID_THOI_KHOA_BIEU
                                  ORDER BY GV.ID_THOI_KHOA_BIEU) LISTGV on LISTGV.ID = TKB.ID
                       LEFT JOIN (SELECT GV.ID_THOI_KHOA_BIEU                          ID,
                                         LISTAGG(GV.GIANG_VIEN || '_' || TD.VIET_TAT || CB.HO || ' ' || CB.TEN, ',')
                                                 WITHIN GROUP (ORDER BY GV.GIANG_VIEN) LISTTG
                                  FROM DT_THOI_KHOA_BIEU_GIANG_VIEN GV
                                           LEFT JOIN TCHC_CAN_BO CB on GV.GIANG_VIEN = CB.SHCC
                                           LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                                  WHERE TYPE = 'TG'
                                  GROUP BY GV.ID_THOI_KHOA_BIEU
                                  ORDER BY GV.ID_THOI_KHOA_BIEU) LISTTG on LISTTG.ID = TKB.ID
                       LEFT JOIN (SELECT LISTAGG(sTKBN.ID_NGANH, ',') WITHIN GROUP (ORDER BY NULL) AS ID_NGANH,
                                         sTKBN.ID_THOI_KHOA_BIEU,
                                         LISTAGG(NDT.KHOA, ',') WITHIN GROUP (ORDER BY NULL)       AS KHOA_NGANH,
                                         LISTAGG(DSCN.KHOA, ',') WITHIN GROUP (ORDER BY NULL)      AS KHOA_CN
                                  FROM DT_THOI_KHOA_BIEU_NGANH sTKBN
                                           LEFT JOIN DT_THOI_KHOA_BIEU sTKB ON sTKBN.ID_THOI_KHOA_BIEU = sTKB.ID
                                           LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH IN sTKBN.ID_NGANH
                                           LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH DSCN
                                                     ON (DSCN.NGANH || '##' || DSCN.ID) IN sTKBN.ID_NGANH
                                  GROUP BY sTKBN.ID_THOI_KHOA_BIEU) TKBN
                                 ON TKBN.ID_THOI_KHOA_BIEU = TKB.ID

--                        LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH IN TKBN.ID_NGANH
--                        LEFT JOIN DT_DANH_SACH_CHUYEN_NGANH DSCN ON (DSCN.NGANH || '##' || DSCN.ID) IN TKBN.ID_NGANH

              WHERE (khoaSinhVienFilter IS NULL OR khoaSinhVienFilter = '' OR TKB.KHOA_SINH_VIEN = khoaSinhVienFilter)
                AND (namFilter IS NULL OR namFilter = '' OR namFilter = TKB.NAM)
                AND (hocKy IS NULL OR hocKy = '' OR hocKy = TKB.HOC_KY)
                AND (donVi IS NULL OR donVi = '' OR donVi IN (SELECT regexp_substr(TKBN.KHOA_NGANH, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(TKBN.KHOA_NGANH, '[^,]+', 1, level) is not null)
                  OR donVi IN (SELECT regexp_substr(TKBN.KHOA_CN, '[^,]+', 1, level)
                               from dual
                               connect by regexp_substr(TKBN.KHOA_CN, '[^,]+', 1, level) is not null)
                  )
                AND (bacDaoTaoFilter IS NULL OR bacDaoTaoFilter = '' OR bacDaoTaoFilter = TKB.BAC_DAO_TAO)
                AND (loaiHinhDaoTaoFilter IS NULL OR loaiHinhDaoTaoFilter = '' OR
                     loaiHinhDaoTaoFilter = TKB.LOAI_HINH_DAO_TAO)
                AND (phongFilter IS NULL OR phongFilter = '' OR phongFilter = TKB.PHONG)
                AND (thuFilter IS NULL OR thuFilter = '' OR thuFilter = TKB.THU)
                AND (monHocFilter IS NULL OR monHocFilter = '' OR monHocFilter = TKB.MA_MON_HOC)

                AND (searchTerm = ''
                  OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                  OR LOWER(TRIM(DV.TEN)) LIKE sT
                  OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                  OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                  OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                  OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm))
              ORDER BY TKB.THU NULLS FIRST, TKB.KHOA_DANG_KY)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE tccb_dinh_muc_cong_viec_gv_va_ncv_gan_thu_tu(p_id in NUMBER, p_thu_tu in number, p_is_up in number,
                                                             p_nhom in NUMBER)
    IS
BEGIN
    IF p_is_up = 1 THEN
        UPDATE TCCB_DINH_MUC_CONG_VIEC_GV_VA_NCV SET thu_tu=thu_tu + 1 WHERE thu_tu >= p_thu_tu AND p_nhom = ID_NHOM;
    ELSE
        UPDATE TCCB_DINH_MUC_CONG_VIEC_GV_VA_NCV SET thu_tu=thu_tu - 1 WHERE thu_tu <= p_thu_tu AND p_nhom = ID_NHOM;
    END IF;
    UPDATE TCCB_DINH_MUC_CONG_VIEC_GV_VA_NCV SET thu_tu=p_thu_tu WHERE id = p_id;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE tccb_khung_danh_gia_can_bo_gan_thu_tu(p_id in NUMBER, p_thu_tu in number, p_is_up in number,
                                                             p_nam in NUMBER)
    IS
BEGIN
    IF p_is_up = 1 THEN
        UPDATE TCCB_KHUNG_DANH_GIA_CAN_BO SET thu_tu=thu_tu + 1 WHERE thu_tu >= p_thu_tu AND p_nam = NAM;
    ELSE
        UPDATE TCCB_KHUNG_DANH_GIA_CAN_BO SET thu_tu=thu_tu - 1 WHERE thu_tu <= p_thu_tu AND p_nam = NAM;
    END IF;
    UPDATE TCCB_KHUNG_DANH_GIA_CAN_BO SET thu_tu=p_thu_tu WHERE id = p_id;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE tccb_nhom_danh_gia_nhiem_vu_gan_thu_tu(p_id in NUMBER, p_thu_tu in number, p_is_up in number,
                                                             p_nam in NUMBER)
    IS
BEGIN
    IF p_is_up = 1 THEN
        UPDATE TCCB_NHOM_DANH_GIA_NHIEM_VU SET thu_tu=thu_tu + 1 WHERE thu_tu >= p_thu_tu AND p_nam = NAM;
    ELSE
        UPDATE TCCB_NHOM_DANH_GIA_NHIEM_VU SET thu_tu=thu_tu - 1 WHERE thu_tu <= p_thu_tu AND p_nam = NAM;
    END IF;
    UPDATE TCCB_NHOM_DANH_GIA_NHIEM_VU SET thu_tu=p_thu_tu WHERE id = p_id;
    commit;
END;

/
--EndMethod--