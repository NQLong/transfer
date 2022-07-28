CREATE OR REPLACE FUNCTION DT_CAU_TRUC_KHUNG_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER)
    RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
    WHERE searchTerm = ''
       OR cauTrucKhungDt.NAM_DAO_TAO LIKE st;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT cauTrucKhungDt.ID               as                      "id",
                     cauTrucKhungDt.BAT_DAU_DANG_KY  as                      "batDauDangKy",
                     cauTrucKhungDt.KET_THUC_DANG_KY as                      "ketThucDangKy",
                     cauTrucKhungDt.MUC_CHA          as                      "mucCha",
                     cauTrucKhungDt.MUC_CON          as                      "mucCon",
                     cauTrucKhungDt.NAM_DAO_TAO      as                      "namDaoTao",
                     BDT.TEN_BAC                     AS                      "tenBacDaoTao",
                     ROW_NUMBER() OVER (ORDER BY cauTrucKhungDt.NAM_DAO_TAO) R
              FROM DT_CAU_TRUC_KHUNG_DAO_TAO cauTrucKhungDt
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = cauTrucKhungDt.BAC_DAO_TAO
              WHERE searchTerm = ''
                 OR cauTrucKhungDt.NAM_DAO_TAO LIKE st)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    maCanBo IN STRING,
    donViGui IN NUMBER,
    donVi IN NUMBER,
    loaiCongVan IN NUMBER,
    loaiVanBan IN STRING,
    donViNhanNgoai IN NUMBER,
    donViXem IN STRING,
    canBoXem IN STRING,
    loaiCanBo IN NUMBER,
    status IN STRING,
    timeType IN NUMBER,
    fromTime IN NUMBER,
    toTime IN NUMBER,
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
                  ((
                               donViGui IS NULL
                           OR (
                                           donViGui IS NOT NULL
                                       AND donViGui = hcthCVD.DON_VI_GUI
                                   )
                       )
                      AND (
                               maCanBo IS NULL
                           OR (
                                           maCanBo IS NOT NULL
                                       AND maCanBo IN
                                           (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                           )
                                   )
                       )
                      AND (
                               donVi IS NULL
                           OR (
                                           donVi IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       )
                      AND (
                               donViNhanNgoai IS NULL
                           OR (
                                           donViNhanNgoai IS NOT NULL
                                       AND EXISTS(
                                                   SELECT hcthDVN.id
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                     AND hcthDVN.DON_VI_NHAN IN (
                                                       select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                   )
                                               )
                                   )
                       ))
                  AND (
                              loaiCongVan IS NULL
                          OR (
                                      (
                                                  loaiCongVan = 1
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                          )
                                      OR (
                                                  loaiCongVan = 2
                                              AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                              AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                          )
                                  )
                      )
                  AND (
                          (
                                      loaiCanBo = 2
                                  OR loaiCanBo = 3
                                  OR loaiCanBo = 4
                                  OR loaiCanBo = 5
                                  OR loaiCanBo = 6
                              )
                          OR
                          ((donViXem IS NULL AND canBoXem IS NULL)
                              OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                           (
                                                               SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                           )
                                  AND (hcthCVD.TRANG_THAI != '1'
                                      OR (hcthCVD.TRANG_THAI = '1'
                                          AND hcthCVD.NGUOI_TAO = canBoXem))
                               )
                              OR (donViXem IS NOT NULL AND EXISTS(
                                      SELECT hcthDVN.ID
                                      FROM HCTH_DON_VI_NHAN hcthDVN
                                      WHERE hcthDVN.MA = hcthCVD.ID
                                        AND hcthDVN.LOAI = 'DI'
                                        AND hcthDVN.DON_VI_NHAN IN
                                            (
                                                select regexp_substr(donViXem, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                            )
                                  )
                                  AND hcthCVD.TRANG_THAI = '10'
                               )
                              OR
                           (canBoXem IS NOT NULL AND canBoXem IN
                                                     (
                                                         SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                     )
                               AND hcthCVD.TRANG_THAI != '1'
                               AND hcthCVD.TRANG_THAI = '10'
                               ))
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
                                          loaiCanBo = 2 -- hcthCongVanDi:manage - chuyên viên quản lý tổng phòng hcth
                                      AND (
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '6'
                                                      AND hcthCVD.TRANG_THAI != '11')
                                                  OR (
                                                          ((hcthCVD.TRANG_THAI = '1' AND hcthCVD.NGUOI_TAO = canBoXem)
                                                              OR hcthCVD.TRANG_THAI = '6'
                                                              OR hcthCVD.TRANG_THAI = '11')
                                                          AND hcthCVD.DON_VI_GUI = '29'
                                                      )
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                          OR (
                                          loaiCanBo = 3 -- hcth:login
                                      AND (
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '6'
                                                      AND hcthCVD.TRANG_THAI != '11')
                                                  OR hcthCVD.TRANG_THAI IS NULL
                                              )
                                  )
                          OR (
                                          loaiCanBo = 4 -- admin
                                      AND (
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '6'
                                                      AND hcthCVD.TRANG_THAI != '11')
                                                  OR (
                                                          (hcthCVD.TRANG_THAI = '1'
                                                              OR hcthCVD.TRANG_THAI = '6'
                                                              OR hcthCVD.TRANG_THAI = '11')
                                                          AND hcthCVD.DON_VI_GUI = donViXem
                                                      )
                                              )
                                  )
                          OR (
                                          loaiCanBo = 5 -- chuyên viên soạn thảo
                                      AND (
                                                  (hcthCVD.NGUOI_TAO = canBoXem)
                                                  OR (
                                                              canBoXem IS NOT NULL AND canBoXem IN
                                                                                       (
                                                                                           SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                                           from dual
                                                                                           connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                                       )
                                                          AND hcthCVD.TRANG_THAI = '11'
                                                      )
                                              )
                                  )
                          OR (
                                          loaiCanBo = 6 -- chuyên viên soạn thảo thuộc phòng hcth
                                      AND (
                                                  (hcthCVD.NGUOI_TAO = canBoXem AND hcthCVD.DON_VI_GUI = '29')
                                                  OR (
                                                              hcthCVD.TRANG_THAI != '1'
                                                          AND hcthCVD.TRANG_THAI != '6'
                                                          AND hcthCVD.TRANG_THAI != '11')
                                              )
                                  )
                      )
                  AND (
                      status IS NULL OR hcthCVD.TRANG_THAI = status
                      )
                  AND (
                      loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                      )
                  AND (
                              timeType IS NULL
                          OR (
                                          fromTime IS NULL
                                      AND toTime IS NULL
                                  )
                          OR (
                                          timeType IS NOT NULL
                                      AND (
                                                      fromTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI >= fromTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY >= fromTime
                                                                  )
                                                          )
                                              )
                                      AND (
                                                      toTime IS NULL
                                                  OR (
                                                              (
                                                                          timeType = 1
                                                                      AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                      AND hcthCVD.NGAY_GUI <= toTime
                                                                  )
                                                              OR (
                                                                          timeType = 2
                                                                      AND hcthCVD.NGAY_KY IS NOT NULL
                                                                      AND hcthCVD.NGAY_KY <= toTime
                                                                  )
                                                          )
                                              )
                                  )
                      )
                  AND (
                              ST = ''
                          OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                          OR LOWER(dvg.TEN) LIKE ST
                          OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                      )
              );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT hcthCVD.ID            AS                     "id",
                        hcthCVD.TRICH_YEU     AS                     "trichYeu",
                        hcthCVD.NGAY_GUI      AS                     "ngayGui",
                        hcthCVD.NGAY_KY       AS                     "ngayKy",
                        hcthCVD.CAN_BO_NHAN   AS                     "maCanBoNhan",
                        hcthCVD.TRANG_THAI    AS                     "trangThai",
                        hcthCVD.LOAI_CONG_VAN AS                     "loaiCongVan",
                        hcthCVD.SO_CONG_VAN   AS                     "soCongVan",
                        hcthCVD.LOAI_VAN_BAN  AS                     "loaiVanBan",
                        dvg.MA                AS                     "maDonViGui",
                        dvg.TEN               AS                     "tenDonViGui",
                        lvb.TEN               AS                     "tenLoaiVanBan",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "maDonViNhan",
                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "donViNhanNgoai",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                     AS                     "danhSachDonViNhan",

                        (
                            SELECT LISTAGG(dvgcv.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvgcv.TEN
                                )
                            FROM DM_DON_VI_GUI_CV dvgcv
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvgcv.ID = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                     AS                     "danhSachDonViNhanNgoai",

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
                                ) END         AS                     "danhSachCanBoNhan",

                        ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                          LEFT JOIN DM_LOAI_CONG_VAN lvb
                                    on hcthCVD.LOAI_VAN_BAN is not null and lvb.ID = hcthCVD.LOAI_VAN_BAN
                 WHERE (
                               ((
                                            donViGui IS NULL
                                        OR (
                                                        donViGui IS NOT NULL
                                                    AND donViGui = hcthCVD.DON_VI_GUI
                                                )
                                    )
                                   AND (
                                            maCanBo IS NULL
                                        OR (
                                                        maCanBo IS NOT NULL
                                                    AND maCanBo IN
                                                        (SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                        )
                                                )
                                    )
                                   AND (
                                            donVi IS NULL
                                        OR (
                                                        donVi IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donVi, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    )
                                   AND (
                                            donViNhanNgoai IS NULL
                                        OR (
                                                        donViNhanNgoai IS NOT NULL
                                                    AND EXISTS(
                                                                SELECT hcthDVN.id
                                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                                  AND hcthDVN.LOAI = 'DI'
                                                                  AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                                                                  AND hcthDVN.DON_VI_NHAN IN (
                                                                    select regexp_substr(donViNhanNgoai, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(donViNhanNgoai, '[^,]+', 1, level) is not null
                                                                )
                                                            )
                                                )
                                    ))
                               AND (
                                           loaiCongVan IS NULL
                                       OR (
                                                   (
                                                               loaiCongVan = 1
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'DON_VI'
                                                       )
                                                   OR (
                                                               loaiCongVan = 2
                                                           AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                           AND hcthCVD.LOAI_CONG_VAN = 'TRUONG'
                                                       )
                                               )
                                   )
                               AND (
                                       (
                                                   loaiCanBo = 2
                                               OR loaiCanBo = 3
                                               OR loaiCanBo = 4
                                               OR loaiCanBo = 5
                                               OR loaiCanBo = 6
                                           )
                                       OR
                                       ((donViXem IS NULL AND canBoXem IS NULL)
                                           OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                                        (
                                                                            SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                            from dual
                                                                            connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                        )
                                               AND (hcthCVD.TRANG_THAI != '1'
                                                   OR (hcthCVD.TRANG_THAI = '1'
                                                       AND hcthCVD.NGUOI_TAO = canBoXem))
                                            )
                                           OR (donViXem IS NOT NULL AND EXISTS(
                                                   SELECT hcthDVN.ID
                                                   FROM HCTH_DON_VI_NHAN hcthDVN
                                                   WHERE hcthDVN.MA = hcthCVD.ID
                                                     AND hcthDVN.LOAI = 'DI'
                                                     AND hcthDVN.DON_VI_NHAN IN
                                                         (
                                                             select regexp_substr(donViXem, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(donViXem, '[^,]+', 1, level) is not null
                                                         )
                                               )
                                               AND hcthCVD.TRANG_THAI = '10'
                                            )
                                           OR
                                        (canBoXem IS NOT NULL AND canBoXem IN
                                                                  (
                                                                      SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                  )
                                            AND hcthCVD.TRANG_THAI = '10'
                                            ))
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
                                                       loaiCanBo = 2 -- hcthCongVanDi:manage
                                                   AND (
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '6'
                                                                   AND hcthCVD.TRANG_THAI != '11')
                                                               OR (
                                                                       ((hcthCVD.TRANG_THAI = '1' AND hcthCVD.NGUOI_TAO = canBoXem)
                                                                           OR hcthCVD.TRANG_THAI = '6'
                                                                           OR hcthCVD.TRANG_THAI = '11')
                                                                       AND hcthCVD.DON_VI_GUI = '29'
                                                                   )
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 3 -- hcth: login
                                                   AND (
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '6'
                                                                   AND hcthCVD.TRANG_THAI != '11')
                                                               OR hcthCVD.TRANG_THAI IS NULL
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 4 -- admin
                                                   AND (
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '6'
                                                                   AND hcthCVD.TRANG_THAI != '11')
                                                               OR (
                                                                       (hcthCVD.TRANG_THAI = '1'
                                                                           OR hcthCVD.TRANG_THAI = '6'
                                                                           OR hcthCVD.TRANG_THAI = '11')
                                                                       AND hcthCVD.DON_VI_GUI = donViXem
                                                                   )
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 5 -- chuyên viên soạn thảo
                                                   AND (
                                                               (hcthCVD.NGUOI_TAO = canBoXem)
                                                               OR (
                                                                           canBoXem IS NOT NULL AND canBoXem IN
                                                                                                    (
                                                                                                        SELECT regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                                                        from dual
                                                                                                        connect by regexp_substr(hcthCVD.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                                                    )
                                                                       AND hcthCVD.TRANG_THAI = '11'
                                                                   )
                                                           )
                                               )
                                       OR (
                                                       loaiCanBo = 6 -- chuyên viên soạn thảo thuộc phòng hcth
                                                   AND (
                                                               (hcthCVD.NGUOI_TAO = canBoXem AND hcthCVD.DON_VI_GUI = '29')
                                                               OR (
                                                                           hcthCVD.TRANG_THAI != '1'
                                                                       AND hcthCVD.TRANG_THAI != '6'
                                                                       AND hcthCVD.TRANG_THAI != '11')
                                                           )
                                               )
                                   )
                               AND (
                                   status IS NULL OR hcthCVD.TRANG_THAI = status
                                   )
                               AND (
                                   loaiVanBan IS NULL OR hcthCVD.LOAI_VAN_BAN = loaiVanBan
                                   )
                               AND (
                                           timeType IS NULL
                                       OR (
                                                       fromTime IS NULL
                                                   AND toTime IS NULL
                                               )
                                       OR (
                                                       timeType IS NOT NULL
                                                   AND (
                                                                   fromTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI >= fromTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY >= fromTime
                                                                               )
                                                                       )
                                                           )
                                                   AND (
                                                                   toTime IS NULL
                                                               OR (
                                                                           (
                                                                                       timeType = 1
                                                                                   AND hcthCVD.NGAY_GUI IS NOT NULL
                                                                                   AND hcthCVD.NGAY_GUI <= toTime
                                                                               )
                                                                           OR (
                                                                                       timeType = 2
                                                                                   AND hcthCVD.NGAY_KY IS NOT NULL
                                                                                   AND hcthCVD.NGAY_KY <= toTime
                                                                               )
                                                                       )
                                                           )
                                               )
                                   )
                               AND (
                                           ST = ''
                                       OR LOWER(hcthCVD.TRICH_YEU) LIKE ST
                                       OR LOWER(dvg.TEN) LIKE ST
                                       OR LOWER(hcthCVD.SO_CONG_VAN) LIKE ST
                                   )
                           )
                 ORDER BY hcthCVD.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
    IS
    maxThuTu           number;
    tenVietTatDonViGui STRING(100);
    loaiVanBan         STRING(10);
    loaiCongVan        STRING(20);
    postfix            STRING(200);
    counter            NUMBER(10);
    isExists           NUMBER(10);
    laySoTuDong        NUMBER(1);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    SELECT dvg.TEN_VIET_TAT
    into tenVietTatDonViGui
    FROM DM_DON_VI dvg
    WHERE dvg.MA = donViGui;

    SELECT lcv.TEN_VIET_TAT
    into loaiVanBan
    FROM HCTH_CONG_VAN_DI hcthCVD
             LEFT JOIN DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
    WHERE hcthCVD.ID = ma;

    select LAY_SO_TU_DONG into laySoTuDong from HCTH_CONG_VAN_DI where id = ma;

    if laySoTuDong = 1 then
        begin
            SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

            select MAX(SO_DI)
            into maxThuTu
            from HCTH_CONG_VAN_DI
            WHERE donViGui = DON_VI_GUI
              and (NGAY_TAO > nam)
              AND LOAI_CONG_VAN = loaiCongVan;
        exception
            when NO_DATA_FOUND then
                maxThuTu := 0;
        end;

        if maxThuTu is null then
            maxThuTu := 0;
        end if;
        maxThuTu := maxThuTu + 1;

        postfix := '/';
        IF loaiVanBan IS NOT NULL THEN
            postfix := postfix || loaiVanBan || '-';
        end if;

        postfix := postfix || 'XHNV';
        IF tenVietTatDonViGui IS NOT NULL THEN
            postfix := postfix || '-' || tenVietTatDonViGui;
        end if;
        counter := 2000;
        select count(*)
        into isExists
        from HCTH_CONG_VAN_DI
        WHERE donViGui = DON_VI_GUI
          and (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = loaiCongVan
          AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
        WHILE isExists > 0
            LOOP
                if counter = 0 then
                    RAISE invalid_number;
                end if;
                maxThuTu := maxThuTu + 1;
                counter := counter - 1;
                select count(*)
                into isExists
                from HCTH_CONG_VAN_DI
                WHERE donViGui = DON_VI_GUI
                  and (NGAY_TAO > nam)
                  AND LOAI_CONG_VAN = loaiCongVan
                  AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
            END LOOP;

        update HCTH_CONG_VAN_DI hcthCVD
        set hcthCVD.SO_DI                   = maxThuTu,
            hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
            hcthCVD.SO_CONG_VAN             = TO_CHAR(maxThuTu) || postfix
        WHERE hcthCVD.ID = ma;
    end if;
    commit;
END;

/
--EndMethod--

DROP FUNCTION HCTH_CONG_VAN_TRINH_KY_GET_FROM;
/
--EndMethod--

CREATE OR REPLACE procedure HCTH_CONG_VAN_DI_VALIDATE_SO_CONG_VAN(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER,
    trangThaiMoi in String
)
AS
    loaiCongVan STRING(20);
    soCongVan   STRING(200);
    counter     NUMBER(10);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'HCTH_CONG_VAN_DI_VALIDATE_SO_CONG_VAN';
    begin
        select cvd.SO_CONG_VAN into soCongVan from HCTH_CONG_VAN_DI cvd where cvd.id = ma;
        SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;
        select count(*)
        into counter
        from HCTH_CONG_VAN_DI cvd
        where cvd.SO_CONG_VAN = soCongVan
          and donViGui = cvd.DON_VI_GUI
          and cvd.NGAY_TAO > nam
          AND cvd.LOAI_CONG_VAN = loaiCongVan
          and ((cvd.LAY_SO_TU_DONG = 0 and cvd.TRANG_THAI in ('9', '10')) or cvd.LAY_SO_TU_DONG = 1);

        if counter > 0 then
            RAISE invalid_number;
        ELSE
            update HCTH_CONG_VAN_DI set TRANG_THAI = trangThaiMoi where ID = ma;
        end if;
    end;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_GET_ALL_FROM(
    congVanId in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcvtk.ID         as "id",
               hcthcvtk.NGUOI_TAO  as "nguoiTao",
               hcthcvtk.THOI_GIAN  as "thoiGian",
               hcthcvtk.FILE_CONG_VAN as "fileCongVan",
               cbk.HO as "hoNguoiTao",
               cbk.TEN as "tenNguoiTao",
               hcthFile.TEN as "ten",
                (SELECT LISTAGG(
                    CASE
                        WHEN cbk.HO IS NULL THEN cbk.TEN
                        WHEN cbk.TEN IS NULL THEN cbk.HO
                        ELSE CONCAT(CONCAT(cbk.HO, ' '), cbk.TEN)
                    END, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                            LEFT JOIN TCHC_CAN_BO cbk ON cbk.SHCC = hcthcbk.NGUOI_KY
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachTenCanBoKy",
                (SELECT LISTAGG(hcthcbk.NGUOI_KY, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachShccCanBoKy"
--                  LISTAGG(last_name, '; ') WITHIN GROUP (ORDER BY hire_date, last_name)
--
        from HCTH_CONG_VAN_TRINH_KY hcthcvtk
            LEFT JOIN HCTH_FILE hcthFile on hcthcvtk.FILE_CONG_VAN = hcthFile.ID
            LEFT JOIN TCHC_CAN_BO cbk on hcthcvtk.NGUOI_TAO = cbk.SHCC
        where (hcthcvtk.CONG_VAN = congVanId)
        order by hcthcvtk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

