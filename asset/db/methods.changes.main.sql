DROP FUNCTION DOWNLOAD_EXCEL_QT_KHEN_THUONG_ALL;
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
             LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA

    WHERE (donVi IS NULL OR donVi = dmDv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT dtDangKyMoMon.KHOA      as            "khoa",
                        dtDangKyMoMon.HOC_KY    as            "hocKy",
                        dtDangKyMoMon.NAM       as            "namHoc",
                        dtDangKyMoMon.THOI_GIAN as            "thoiGian",
                        dtDangKyMoMon.GHI_CHU   as            "ghiChu",
                        dtDangKyMoMon.ID        as            "id",
                        dtDangKyMoMon.IS_DUYET  as            "isDuyet",
                        dmDv.TEN                as            "tenKhoaBoMon",
                        dtDangKyMoMon.MA_NGANH  as            "maNganh",
                        ds.TEN_NGANH            as            "tenNganh",
                        ROW_NUMBER() OVER (ORDER BY dmDv.TEN) R
                 FROM DT_DANG_KY_MO_MON dtDangKyMoMon
                          LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA
                          LEFT JOIN DT_NGANH_DAO_TAO ds ON ds.MA_NGANH = dtDangKyMoMon.MA_NGANH
                 WHERE (donVi IS NULL OR donVi = dmDv.MA)
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

DROP FUNCTION DT_DS_MON_MO_SEARCH_PAGE;
/
--EndMethod--

DROP FUNCTION GET_MA_DON_VI_MAX;
/
--EndMethod--

DROP FUNCTION HCTH_CONG_VAN_DEN_GET_ALL_CHI_DAO;
/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    maCanBo IN STRING,
    donViGui IN NUMBER,
    donVi IN NUMBER,
    loaiCongVan IN NUMBER,
    donViNhanNgoai IN NUMBER,
    donViXem IN STRING,
    canBoXem IN STRING,
    loaiCanBo IN NUMBER,
    congVanLaySo IN NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthCVD
             LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
    WHERE (
                (
                      (
                                  donViGui IS NULL
                              AND donVi IS NULL
                              AND maCanBo IS NULL
                              AND donViNhanNgoai IS NULL
                          )
                      OR (
                                  donViGui IS NOT NULL
                              AND donViGui = hcthCVD.DON_VI_GUI
                          )
                      OR (
                                  maCanBo IS NOT NULL
                              AND maCanBo IN
                                  (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                  )
                          )
                      OR (
                                  donVi IS NOT NULL
                              AND donVi IN
                                  (
                                      SELECT regexp_substr(hcthCVD.DON_VI_NHAN, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthCVD.DON_VI_NHAN, '[^,]+', 1, level) is NOT NULL
                                                 )
                          )
                      OR (
                                  donViNhanNgoai IS NOT NULL
                              AND donViNhanNgoai IN
                                  (
                                      SELECT regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level) is NOT NULL
                                                 )
                          )
                      )
                  AND (
                            loaiCongVan IS NULL
                          OR (
                                  (
                                              loaiCongVan = 1
                                          AND hcthCVD.NOI_BO IS NOT NULL
                                          AND hcthCVD.NOI_BO = 1
                                      )
                                  OR (
                                              loaiCongVan = 2
                                          AND hcthCVD.NOI_BO IS NOT NULL
                                          AND hcthCVD.NOI_BO = 0
                                      )
                              )
                      )
                  AND (
                            congVanLaySo IS NULL
                        OR (
                                (
                                        congVanLaySo = 1
                                    AND hcthCVD.LAY_SO IS NOT NULL
                                    AND hcthCVD.LAY_SO = 1
                                    )
                                OR (
                                        congVanLaySo = 2
                                    AND hcthCVD.LAY_SO IS NOT NULL
                                    AND hcthCVD.LAY_SO = 0
                                    )
                                )
                      )
                  AND (
                            (donViXem IS NULL AND canBoXem IS NULL)
                          OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                       (
                                                           SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                       )
                              )
                          OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_NHAN IN
                                                       (
                                                           SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                       )
                              AND hcthCVD.TRANG_THAI != '1'
                              )
                          OR
                          (canBoXem IS NOT NULL AND canBoXem IN
                                                    (
                                                        SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                    )
                              AND hcthCVD.TRANG_THAI != '1'
                              )
                      )
                  AND (
                            loaiCanBo = 0 -- staff
                            OR (
                                    loaiCanBo = 1 -- rector
                                    AND (
                                        hcthCVD.TRANG_THAI != '1'
                                        OR hcthCVD.TRANG_THAI IS NULL
                                        )
                                )
                            OR (
                                    loaiCanBo = 2 -- hcth
                                    AND (
                                        hcthCVD.TRANG_THAI != '1'
                                        OR (
                                            hcthCVD.TRANG_THAI = '1'
                                            AND hcthCVD.DON_VI_GUI = '29'
                                            )
                                        OR hcthCVD.TRANG_THAI IS NULL
                                        )
                                )
                      )
                  AND (
                              ST = ''
                          OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                          OR LOWER(dvg.TEN) LIKE ST
                      )
              );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT hcthCVD.ID                AS                 "id",
                        hcthCVD.TRICH_YEU         AS                 "trichYeu",
                        hcthCVD.NGAY_GUI          AS                 "ngayGui",
                        hcthCVD.NGAY_KY           AS                 "ngayKy",
                        hcthCVD.DON_VI_NHAN       AS                 "maDonViNhan",
                        hcthCVD.CAN_BO_NHAN       AS                 "maCanBoNhan",
                        hcthCVD.NOI_BO            AS                 "noiBo",
                        hcthCVD.TRANG_THAI        AS                 "trangThai",
                        hcthCVD.DON_VI_NHAN_NGOAI AS                 "donViNhanNgoai",
                        hcthCVD.SO_DI             AS                 "soDi",
                        hcthCVD.LOAI_CONG_VAN     AS                 "loaiCongVan",
                        dvg.MA                    AS                 "maDonViGui",
                        dvg.TEN                   AS                 "tenDonViGui",
                        dvg.TEN_VIET_TAT         AS                 "tenVietTatDonViGui",

                        CASE
                            WHEN hcthCVD.DON_VI_NHAN IS NULL then NULL
                            ELSE (
                                SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                    order by dvn.TEN
                                    )
                                FROM DM_DON_VI dvn
                                WHERE (
                                              (
                                                  SELECT Count(*)
                                                  from (
                                                           select to_number(column_value) as IDs
                                                           from xmltable(hcthCVD.DON_VI_NHAN)
                                                       )
                                                  where IDs = dvn.MA
                                              ) != 0
                                          )
                            )
                            END                   AS                 "danhSachDonViNhan",

                        CASE
                            WHEN hcthCVD.DON_VI_NHAN_NGOAI IS NULL then NULL
                            ELSE (
                                SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                    order by dvn.TEN
                                    )
                                FROM DM_DON_VI_GUI_CV dvn
                                WHERE (
                                              (
                                                  SELECT Count(*)
                                                  from (
                                                           select to_number(column_value) as IDs
                                                           from xmltable(hcthCVD.DON_VI_NHAN_NGOAI)
                                                       )
                                                  where IDs = dvn.ID
                                              ) != 0
                                          )
                            )
                            END                   AS                 "danhSachDonViNhanNgoai",

                        CASE
                            when hcthCVD.CAN_BO_NHAN is not null then
                                (
                                    SELECT LISTAGG(
                                                   CASE
                                                       WHEN cbn.HO IS NULL THEN cbn.TEN
                                                       WHEN cbn.TEN IS NULL THEN cbn.HO
                                                       WHEN DMCV.TEN IS NULL THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                       ELSE CONCAT(CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                                   cbn.TEN)
                                                       END,
                                                   '; '
                                               ) WITHIN GROUP (
                                                       order by cbn.TEN
                                                       ) as hoVaTenCanBo
                                    FROM TCHC_CAN_BO cbn
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cbn.SHCC in (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                ) END             AS                 "danhSachCanBoNhan",

                        CASE
                            when hcthCVD.LOAI_CONG_VAN is not null then
                            (
                                SELECT TEN_VIET_TAT
                                FROM DM_LOAI_CONG_VAN
                                WHERE ID=hcthCVD.LOAI_CONG_VAN
                            ) END AS "tenVietTatLoaiCongVanDi",

                    ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                 WHERE (
                            (
                                  (
                                              donViGui IS NULL
                                          AND donVi IS NULL
                                          AND maCanBo IS NULL
                                          AND donViNhanNgoai IS NULL
                                      )
                                  OR (
                                              donViGui IS NOT NULL
                                          AND donViGui = hcthCVD.DON_VI_GUI
                                      )
                                  OR (
                                              maCanBo IS NOT NULL
                                          AND maCanBo IN
                                              (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                              )
                                      )
                                  OR (
                                              donVi IS NOT NULL
                                          AND donVi IN
                                              (
                                                  SELECT regexp_substr(hcthCVD.DON_VI_NHAN, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(hcthCVD.DON_VI_NHAN, '[^,]+', 1, level) is NOT NULL
                                                             )
                                      )
                                  OR (
                                              donViNhanNgoai IS NOT NULL
                                          AND donViNhanNgoai IN
                                              (
                                                  SELECT regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(hcthCVD.DON_VI_NHAN_NGOAI, '[^,]+', 1, level) is NOT NULL
                                                             )
                                      )
                                  )
                              AND (
                                        loaiCongVan IS NULL
                                      OR (
                                              (
                                                          loaiCongVan = 1
                                                      AND hcthCVD.NOI_BO IS NOT NULL
                                                      AND hcthCVD.NOI_BO = 1
                                                  )
                                              OR (
                                                          loaiCongVan = 2
                                                      AND hcthCVD.NOI_BO IS NOT NULL
                                                      AND hcthCVD.NOI_BO = 0
                                                  )
                                          )
                                  )
                              AND (
                                        congVanLaySo IS NULL
                                    OR (
                                            (
                                                    congVanLaySo = 1
                                                AND hcthCVD.LAY_SO IS NOT NULL
                                                AND hcthCVD.LAY_SO = 1
                                                )
                                            OR (
                                                    congVanLaySo = 2
                                                AND hcthCVD.LAY_SO IS NOT NULL
                                                AND hcthCVD.LAY_SO = 0
                                                )
                                            )
                                  )
                              AND (
                                        (donViXem IS NULL AND canBoXem IS NULL)
                                      OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                                   (
                                                                       SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                   )
                                          )
                                      OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_NHAN IN
                                                                   (
                                                                       SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                   )
                                          AND hcthCVD.TRANG_THAI != '1'
                                          )
                                      OR
                                      (canBoXem IS NOT NULL AND canBoXem IN
                                                                (
                                                                    SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                )
                                          AND hcthCVD.TRANG_THAI != '1'
                                          )
                                  )
                              AND (
                                        loaiCanBo = 0 -- staff
                                        OR (
                                                loaiCanBo = 1 -- rector
                                                AND (
                                                    hcthCVD.TRANG_THAI != '1'
                                                    OR hcthCVD.TRANG_THAI IS NULL
                                                    )
                                            )
                                        OR (
                                                loaiCanBo = 2 -- hcth
                                                AND (
                                                    hcthCVD.TRANG_THAI != '1'
                                                    OR (
                                                        hcthCVD.TRANG_THAI = '1'
                                                        AND hcthCVD.DON_VI_GUI = '29'
                                                        )
                                                    OR hcthCVD.TRANG_THAI IS NULL
                                                    )
                                            )
                                  )
                              AND (
                                          ST = ''
                                      OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                                      OR LOWER(dvg.TEN) LIKE ST
                                  )
                          )
                 ORDER BY hcthCVD.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
END;

/
--EndMethod--

DROP FUNCTION QT_CHUC_VU_GROUP_PAGE_MA;
/
--EndMethod--

DROP FUNCTION QT_NGHI_VIEC_GROUP_PAGE_MA;
/
--EndMethod--

