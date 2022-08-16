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
                        hcthCVD.NGAY_TAO      AS                     "ngayTao",
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

CREATE OR REPLACE function HCTH_CONG_VAN_DI_SEARCH_SELECTOR(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor  SYS_REFCURSOR;
    sT         STRING(500) := '%' || lower(searchTerm) || '%';
    donViCanBo STRING(24);
    shccCanBo  STRING(24);
    fromTime   NUMBER(20);
    toTime     NUMBER(20);
    staffType  NUMBER(4);
    ids        STRING(64);
    hasIds     NUMBER(1);
    excludeIds STRING(64);

BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.toTime') INTO toTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.staffType') INTO staffType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.ids') INTO ids FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.excludeIds') INTO excludeIds FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.hasIds') INTO hasIds FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthcvd
    WHERE
      -- permisssion check
        (
                (staffType = 1 AND (hcthcvd.TRANG_THAI != '1' OR hcthcvd.TRANG_THAI IS NULL)) OR
                (staffType = 2 AND (
                        (hcthcvd.TRANG_THAI != '1' AND hcthcvd.TRANG_THAI != '4')
                        OR ((hcthcvd.TRANG_THAI = '1' OR hcthcvd.TRANG_THAI = '4') AND hcthcvd.DON_VI_GUI = '29')
                        OR hcthcvd.TRANG_THAI IS NULL
                    )) OR
                (staffType = 0 AND (donViCanBo IS NOT NULL AND EXISTS(
                        SELECT hcthDVN.ID
                        FROM HCTH_DON_VI_NHAN hcthDVN
                        WHERE hcthDVN.MA = hcthcvd.ID
                          AND hcthDVN.LOAI = 'DI'
                          AND hcthDVN.DON_VI_NHAN IN
                              (
                                  select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                  from dual
                                  connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                              )
                    )
                    AND hcthcvd.TRANG_THAI != '1'
                    AND hcthcvd.TRANG_THAI != '4'
                    )
                    OR (donViCanBo IS NOT NULL AND hcthcvd.DON_VI_GUI IN
                                                   (
                                                       SELECT regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is NOT NULL
                                                   )
                     )
                    OR (
                             shccCanBo IS NOT NULL AND shccCanBo IN
                                                       (
                                                           SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                       )
                         AND hcthcvd.TRANG_THAI != '1'
                     )
                    )
            ) --filter
      and (fromTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO > fromTime))
      AND (toTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO < toTime))
      AND (
                sT is null
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
        )
      AND (hasIds = 0 or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
      AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null));
    IF pageNumber < 1 THEN
        pageNumber := 1;
    END IF;
    IF pageSize < 1 THEN
        pageSize := 1;
    END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
--         select ID as "id" from HCTH_CONG_VAN_DI;
        SELECT *
        FROM (SELECT hcthcvd.ID            AS                     "id",
                     hcthcvd.SO_DI         AS                     "soDi",
                     hcthcvd.LOAI_CONG_VAN AS                     "loai",
                     hcthcvd.DON_VI_GUI    AS                     "maDonViGui",
                     dvg.TEN               AS                     "tenDonViGui",
                     hcthcvd.TRICH_YEU     AS                     "trichYeu",
                     hcthcvd.TRANG_THAI    AS                     "trangThai",
                     hcthcvd.NGAY_TAO      AS                     "ngayTao",

                     ROW_NUMBER() OVER (ORDER BY hcthcvd.ID DESC) R
              FROM HCTH_CONG_VAN_DI hcthcvd
                       LEFT JOIN DM_DON_VI dvg on hcthcvd.DON_VI_GUI = dvg.MA
              WHERE
                -- permisssion check
                  (
                          (staffType = 1 AND (hcthcvd.TRANG_THAI != '1' OR hcthcvd.TRANG_THAI IS NULL)) OR
                          (staffType = 2 AND (
                                  (hcthcvd.TRANG_THAI != '1' AND hcthcvd.TRANG_THAI != '4')
                                  OR
                                  ((hcthcvd.TRANG_THAI = '1' OR hcthcvd.TRANG_THAI = '4') AND hcthcvd.DON_VI_GUI = '29')
                                  OR hcthcvd.TRANG_THAI IS NULL
                              )) OR
                          (staffType = 0 AND (donViCanBo IS NOT NULL AND EXISTS(
                                  SELECT hcthDVN.ID
                                  FROM HCTH_DON_VI_NHAN hcthDVN
                                  WHERE hcthDVN.MA = hcthcvd.ID
                                    AND hcthDVN.LOAI = 'DI'
                                    AND hcthDVN.DON_VI_NHAN IN
                                        (
                                            select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                                        )
                              )
                              AND hcthcvd.TRANG_THAI != '1'
                              AND hcthcvd.TRANG_THAI != '4'
                              )
                              OR (donViCanBo IS NOT NULL AND hcthcvd.DON_VI_GUI IN
                                                             (
                                                                 SELECT regexp_substr(donViCanBo, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is NOT NULL
                                                             )
                               )
                              OR (
                                       shccCanBo IS NOT NULL AND shccCanBo IN
                                                                 (
                                                                     SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is NOT NULL
                                                                 )
                                   AND hcthcvd.TRANG_THAI != '1'
                               )
                              )
                      ) --filter
                and (fromTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO > fromTime))
                AND (toTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO < toTime))
                AND (
                          sT is null
                      OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                  )
                AND (hasIds = 0 or hcthcvd.id in (select regexp_substr(ids, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(ids, '[^,]+', 1, level) is not null))
                AND (excludeIds is NUll or hcthcvd.id not in (select regexp_substr(excludeIds, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(excludeIds, '[^,]+', 1, level) is not null)))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_LIEN_KET_GET_ALL_FROM(
    targetA IN NUMBER,
    targetTypeA IN NVARCHAR2,
    targetB IN NUMBER,
    targetTypeB IN NVARCHAR2
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT lk.ID                   as "id",
               lk.LOAI_A               as "loaiA",
               lk.KEY_A                as "keyA",
               lk.LOAI_B               as "loaiB",
               lk.KEY_B                as "keyB",
               hcthcvden.TRICH_YEU     as "trichYeuDen",
               hcthcvden.SO_CONG_VAN   as "soCongVanDen",
               hcthcvden.NGAY_NHAN     as "ngayNhan",
               hcthcvden.NGAY_CONG_VAN as "ngayCongVan",
               hcthcvden.SO_DEN        as "soDen",

               hcthcvdi.NGAY_TAO       AS "ngayTaoDi",
               hcthcvdi.TRICH_YEU      as "trichYeuDi"
        FROM HCTH_LIEN_KET lk
                 LEFT JOIN HCTH_CONG_VAN_DEN hcthcvden ON hcthcvden.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DEN'
                 LEFT JOIN HCTH_CONG_VAN_DI hcthcvdi
                           ON hcthcvdi.ID = lk.KEY_B and (lk.LOAI_B = 'CONG_VAN_DI' OR lk.LOAI_B = 'VAN_BAN_DI')
        WHERE (targetA is null or lk.KEY_A = targetA)
          and (targetTypeA is null or lk.LOAI_A = targetTypeA)
          and (targetB is null or lk.KEY_B = targetB)
          and (targetTypeB is null or lk.LOAI_B = targetTypeB);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                filter IN STRING, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TC_INFO            SYS_REFCURSOR;
    namHoc             STRING(11);
    hocKy              STRING(4);
    listBacDaoTao      STRING(20);
    listLoaiHinhDaoTao STRING(50);
    listLoaiPhi        STRING(40);
    sT                 STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN

    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiPhi') INTO listLoaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_DINH_MUC_HOC_PHI TCDM
             LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
             LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
             LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
    WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
      AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
      AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
      AND (listBacDaoTao IS NULL OR
           listBacDaoTao IS NOT NULL AND
           TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                from dual
                                connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
      AND (listLoaiPhi IS NULL OR
           listLoaiPhi IS NOT NULL AND
           TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                             from dual
                             connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
      AND (listLoaiHinhDaoTao IS NULL OR
           listLoaiHinhDaoTao IS NOT NULL AND
           TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TC_INFO FOR
        SELECT *
        FROM (SELECT TCDM.HOC_KY           AS                  "hocKy",
                     TCDM.LOAI_PHI         AS                  "loaiPhi",
                     TCLP.TEN              AS                  "tenLoaiPhi",
                     TCDM.NAM_HOC          AS                  "namBatDau",
                     TCDM.NAM_KET_THUC     AS                  "namKetThuc",
                     BDT.TEN_BAC           AS                  "tenBacDaoTao",
                     BDT.MA_BAC            AS                  "bacDaoTao",
                     LHDT.MA               AS                  "heDaoTaoDh",
                     DHS.MA                AS                  "heDaoTaoSdh",
                     LHDT.TEN              AS                  "tenHeDh",
                     DHS.TEN               AS                  "tenHeSdh",
                     TCDM.SO_TIEN_MAC_DINH AS                  "soTienMacDinh",
                     ROW_NUMBER() OVER (ORDER BY TCDM.NAM_HOC) R
              FROM TC_DINH_MUC_HOC_PHI TCDM
                       LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
                       LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
                       LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.MA
              WHERE (searchTerm = '' OR lower(TCLP.TEN) LIKE sT)
                AND (namHoc IS NOT NULL AND TCDM.NAM_HOC = namHoc OR namHoc IS NULL)
                AND (hocKy IS NOT NULL AND TCDM.HOC_KY = hocKy OR hocKy IS NULL)
                AND (listBacDaoTao IS NULL OR
                     listBacDaoTao IS NOT NULL AND
                     TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
                AND (listLoaiPhi IS NULL OR
                     listLoaiPhi IS NOT NULL AND
                     TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
                AND (listLoaiHinhDaoTao IS NULL OR
                     listLoaiHinhDaoTao IS NOT NULL AND
                     TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null))
              )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN TC_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_DINH_MUC_HOC_PHI_GET_ITEM_BY(filter IN STRING) RETURN SYS_REFCURSOR
AS
    TC_INFO            SYS_REFCURSOR;
    namHoc             STRING(11);
--     hocKy              STRING(4);
    listBacDaoTao      STRING(20);
    listLoaiHinhDaoTao STRING(50);
    listLoaiPhi        STRING(40);
BEGIN

    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
--     SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listBacDaoTao') INTO listBacDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiPhi') INTO listLoaiPhi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;

    OPEN TC_INFO FOR
        SELECT
--             TCDM.HOC_KY           AS                  "hocKy",
               TCDM.LOAI_PHI         AS                  "loaiPhi",
               TCLP.TEN              AS                  "tenLoaiPhi",
               TCDM.NAM_HOC          AS                  "namHoc",
               BDT.TEN_BAC           AS                  "tenBacDaoTao",
               TCDM.BAC_DAO_TAO      AS                  "bacDaoTao",
               LHDT.MA               AS                  "heDaoTaoDh",
               DHS.MA                AS                  "heDaoTaoSdh",
               LHDT.TEN              AS                  "tenHeDh",
               DHS.TEN               AS                  "tenHeSdh",
               TCDM.SO_TIEN          AS                  "soTien"
        FROM TC_DINH_MUC_HOC_PHI TCDM
                 LEFT JOIN TC_LOAI_PHI TCLP ON TCLP.ID = TCDM.LOAI_PHI
                 LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = TCDM.LOAI_DAO_TAO
                 LEFT JOIN DM_SV_BAC_DAO_TAO BDT ON BDT.MA_BAC = TCDM.BAC_DAO_TAO
                 LEFT JOIN DM_HOC_SDH DHS ON DHS.MA = TCDM.LOAI_DAO_TAO
        WHERE TCDM.NAM_HOC = namHoc
--           AND TCDM.HOC_KY = hocKy
          AND (listBacDaoTao IS NULL OR
               listBacDaoTao IS NOT NULL AND
               TCDM.BAC_DAO_TAO IN (SELECT regexp_substr(listBacDaoTao, '[^,]+', 1, level)
                                    from dual
                                    connect by regexp_substr(listBacDaoTao, '[^,]+', 1, level) is not null))
          AND (listLoaiPhi IS NULL OR
               listLoaiPhi IS NOT NULL AND
               TCDM.LOAI_PHI IN (SELECT regexp_substr(listLoaiPhi, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(listLoaiPhi, '[^,]+', 1, level) is not null))
          AND (listLoaiHinhDaoTao IS NULL OR
               listLoaiHinhDaoTao IS NOT NULL AND
               TCDM.LOAI_DAO_TAO IN (SELECT regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(listLoaiHinhDaoTao, '[^,]+', 1, level) is not null));
    RETURN TC_INFO;
END;

/
--EndMethod--

