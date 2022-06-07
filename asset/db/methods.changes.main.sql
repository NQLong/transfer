CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_DOWNLOAD(
    donViGuiCV IN NUMBER,
    listDonVi in STRING,
    maCanBo IN STRING,
    timeType IN NUMBER,
    fromTime in NUMBER,
    toTime IN NUMBER,
    sortBy IN STRING,
    sortType in STRING,
    shccCanBo IN STRING,
    donViCanBo in STRING,
    staffType in NUMBER,
    status in NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DEN hcthcvd
             LEFT JOIN DM_DON_VI_GUI_CV dvgcv on hcthcvd.DON_VI_GUI = dvgcv.ID
    WHERE (
            (
                        donViGuiCV IS NULL
                    AND maCanBo IS NULL
                    AND listDonVi IS NULL
                )
            OR (
                        donViGuiCV IS NOT NULL
                    AND donViGuiCV = hcthcvd.DON_VI_GUI
                )
            OR (
                        maCanBo is NOT NULL
                    AND maCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
            OR (
                        listDonVi IS NOT NULL
                    AND Exists(
                                select hcthdvn.id
                                from HCTH_DON_VI_NHAN hcthdvn
                                where hcthdvn.MA = hcthcvd.id
                                  and hcthdvn.LOAI = 'DEN'
                                  and hcthdvn.DON_VI_NHAN in
                                      (
                                          select regexp_substr(listDonVi, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null
                                      )
                            )
                ))
      AND (
                timeType is null
            or (
                            fromTime is null
                        and toTime is NUll
                    )
            or (
                            timeType IS NOT NULL
                        AND (
                                        fromTime is NULL
                                    OR (
                                                (
                                                            timeType = 1
                                                        AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                        AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                                    )
                                                OR (
                                                            timeType = 2
                                                        AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                        AND hcthcvd.NGAY_NHAN >= fromTime
                                                    )
                                                OR (
                                                            timeType = 3
                                                        AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                        AND hcthcvd.NGAY_HET_HAN >= fromTime
                                                    )
                                            )
                                )
                        AND (
                                        toTime is NULL
                                    OR (
                                                (
                                                            timeType = 1
                                                        AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                        AND hcthcvd.NGAY_CONG_VAN <= toTime
                                                    )
                                                OR (
                                                            timeType = 2
                                                        AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                        AND hcthcvd.NGAY_NHAN <= toTime
                                                    )
                                                OR (
                                                            timeType = 3
                                                        AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                        AND hcthcvd.NGAY_HET_HAN <= toTime
                                                    )
                                            )
                                )
                    )
        )
      AND (
            (donViCanBo is null and shccCanBo is null) or
            (donViCanBo is not null and Exists(
                    select hcthdvn.id
                    from HCTH_DON_VI_NHAN hcthdvn
                    where hcthdvn.MA = hcthcvd.id
                      and hcthdvn.LOAI = 'DEN'
                      and hcthdvn.DON_VI_NHAN in
                          (
                              select regexp_substr(donViCanBo, '[^,]+', 1, level)
                              from dual
                              connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                          )
                )
                )
            or (
                        shccCanBo is not null and
                        shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                )
        )
      AND (
                sT is null
            OR LOWER(hcthcvd.SO_DEN) LIKE st
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
            OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
            OR LOWER(dvgcv.TEN) LIKE sT
        )
      AND (
--           staffType : 0 - hcth, 1 - rector, 2 - staff
                staffType = 0 or
                (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                (staffType = 2 and hcthcvd.TRANG_THAI = 5)
        )
      AND (
        status is NULL or hcthcvd.TRANG_THAI = status
        );
--     IF pageNumber < 1 THEN
--         pageNumber := 1;
--     END IF;
--     IF pageSize < 1 THEN
--         pageSize := 1;
--     END IF;
--     pageTotal := CEIL(totalItem / pageSize);
--     pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hcthcvd.ID            AS "id",
                        hcthcvd.SO_DEN        AS "soDen",
                        hcthcvd.NGAY_NHAN     AS "ngayNhan",
                        hcthcvd.TRICH_YEU     AS "trichYeu",
                        hcthcvd.NGAY_CONG_VAN AS "ngayCongVan",
                        hcthcvd.NGAY_HET_HAN  AS "ngayHetHan",
                        hcthcvd.SO_CONG_VAN   AS "soCongVan",
                        hcthcvd.CAN_BO_NHAN   AS "maCanBoNhan",
                        hcthcvd.TRANG_THAI    AS "trangThai",
                        dvgcv.ID              AS "maDonViGuiCV",
                        dvgcv.TEN             AS "tenDonViGuiCV",


                        (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                            order by hcthdvn.ID
                            )
                         FROM HCTH_DON_VI_NHAN hcthdvn
                         WHERE hcthdvn.MA = hcthcvd.ID
                           AND hcthdvn.LOAI = 'DEN'
                        )                     AS "maDonViNhan",


                        (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                            order by dvn.TEN
                            )
                         FROM DM_DON_VI dvn
                                  LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                         WHERE hcthdvn.MA = hcthcvd.ID
                           AND hcthdvn.LOAI = 'DEN'
                        )                     AS "danhSachDonViNhan",

                        (SELECT LISTAGG(hcthcd.CHI_DAO, '|') WITHIN GROUP (
                            order by hcthcd.CHI_DAO
                        )
                         FROM HCTH_CHI_DAO hcthcd
                                               WHERE hcthcd.LOAI = 'DEN' AND
                                                     hcthcd.CONG_VAN = hcthcvd.ID) AS "chiDao",

                        CASE
                            when hcthcvd.CAN_BO_NHAN is not null then
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
                                                       ) as "hoVaTenCanBo"
                                    FROM TCHC_CAN_BO cbn
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cbn.SHCC in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                                ) END         AS "danhSachCanBoNhan",


                        CASE
                            WHEN EXISTS(SELECT id
                                        FROM HCTH_CHI_DAO cd
                                        WHERE cd.CONG_VAN = hcthcvd.ID
                                          and cd.LOAI = 'DEN') then 1
                            ELSE 0
                            END               as "hasChiDao",

                        ROW_NUMBER() OVER (
                            ORDER BY
                                CASE
                                    WHEN sortType = 'DESC' THEN
                                        CASE
                                            when sortBy = 'NGAY_NHAN'
                                                then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                            when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                   when hcthcvd.NGAY_HET_HAN is NULL
                                                                                       THEN 0
                                                                                   ELSE hcthcvd.NGAY_HET_HAN end)
                                            when sortBy = 'TINH_TRANG'
                                                then CASE
                                                         when EXISTS(SELECT id
                                                                     FROM HCTH_CHI_DAO cd
                                                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                                                       and cd.LOAI = 'DEN')
                                                             then 1
                                                         else 0 END
                                            ELSE 0 END
                                    ELSE 0 END DESC,
                                CASE
                                    WHEN sortType = 'ASC' THEN
                                        CASE
                                            when sortBy = 'NGAY_NHAN'
                                                then (CASE when hcthcvd.NGAY_NHAN is NULL THEN 0 ELSE hcthcvd.NGAY_NHAN end)
                                            when sortBy = 'NGAY_HET_HAN' then (CASE
                                                                                   when hcthcvd.NGAY_HET_HAN is NULL
                                                                                       THEN 0
                                                                                   ELSE hcthcvd.NGAY_HET_HAN end)
                                            when sortBy = 'TINH_TRANG'
                                                then CASE
                                                         when EXISTS(SELECT id
                                                                     FROM HCTH_CHI_DAO cd
                                                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                                                       and cd.LOAI = 'DEN')
                                                             then 1
                                                         else 0 END
                                            ELSE 0 END
                                    ELSE 0 END,
                                hcthcvd.ID DESC
                            )                    R
                 FROM HCTH_CONG_VAN_DEN hcthcvd
                          LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
                 WHERE (
                         (
                                     donViGuiCV IS NULL
                                 AND maCanBo IS NULL
                                 AND listDonVi IS NULL
                             )
                         OR (
                                     donViGuiCV IS NOT NULL
                                 AND donViGuiCV = hcthcvd.DON_VI_GUI
                             )
                         OR (
                                     maCanBo is NOT NULL
                                 AND maCanBo in
                                     (
                                         select regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                         from dual
                                         connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null
                                     )
                             )
                         OR (
                                     listDonVi IS NOT NULL
                                 AND Exists(
                                             select hcthdvn.id
                                             from HCTH_DON_VI_NHAN hcthdvn
                                             where hcthdvn.MA = hcthcvd.id
                                               and hcthdvn.LOAI = 'DEN'
                                               and hcthdvn.DON_VI_NHAN in
                                                   (
                                                       select regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null
                                                   )
                                         )
                             ))
                   AND (
                             timeType is null
                         or (
                                         fromTime is null
                                     and toTime is NUll
                                 )
                         or (
                                         timeType IS NOT NULL
                                     AND (
                                                     fromTime is NULL
                                                 OR (
                                                             (
                                                                         timeType = 1
                                                                     AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_CONG_VAN >= fromTime
                                                                 )
                                                             OR (
                                                                         timeType = 2
                                                                     AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_NHAN >= fromTime
                                                                 )
                                                             OR (
                                                                         timeType = 3
                                                                     AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_HET_HAN >= fromTime
                                                                 )
                                                         )
                                             )
                                     AND (
                                                     toTime is NULL
                                                 OR (
                                                             (
                                                                         timeType = 1
                                                                     AND hcthcvd.NGAY_CONG_VAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_CONG_VAN <= toTime
                                                                 )
                                                             OR (
                                                                         timeType = 2
                                                                     AND hcthcvd.NGAY_NHAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_NHAN <= toTime
                                                                 )
                                                             OR (
                                                                         timeType = 3
                                                                     AND hcthcvd.NGAY_HET_HAN IS NOT NULL
                                                                     AND hcthcvd.NGAY_HET_HAN <= toTime
                                                                 )
                                                         )
                                             )
                                 )
                     )
                   AND (
                         (donViCanBo is null and shccCanBo is null) or
                         (donViCanBo is not null and Exists(
                                 select hcthdvn.id
                                 from HCTH_DON_VI_NHAN hcthdvn
                                 where hcthdvn.MA = hcthcvd.id
                                   and hcthdvn.LOAI = 'DEN'
                                   and hcthdvn.DON_VI_NHAN in
                                       (
                                           select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null
                                       )
                             )
                             )
                         or (
                                     shccCanBo is not null and
                                     shccCanBo in (SELECT regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)
                             )
                     )
                   AND (
                             sT is null
                         OR LOWER(hcthcvd.SO_DEN) LIKE st
                         OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                         OR LOWER(hcthcvd.TRICH_YEU) LIKE sT
                         OR LOWER(hcthcvd.SO_CONG_VAN) LIKE sT
                         OR LOWER(dvgcv.TEN) LIKE sT
                     )
                   AND (
--           staffType : 0 - hcth, 1 - rector, 2 - normal staff
                             staffType = 0 or
                             (staffType = 1 and hcthcvd.TRANG_THAI != 0) or
                             (staffType = 2 and hcthcvd.TRANG_THAI = 5)
                     )
                   AND (
                     status is NULL or hcthcvd.TRANG_THAI = status
                     )
             )
        ORDER BY R;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_DOWNLOAD_EXCEL(
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
    totalItem OUT NUMBER
) RETURN SYS_REFCURSOR
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
                          (donViXem IS NULL AND canBoXem IS NULL)
                          OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                       (
                                                           SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                       )
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
                          AND hcthCVD.TRANG_THAI != '1'
                          AND hcthCVD.TRANG_THAI != '4'
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
                                                  (hcthCVD.TRANG_THAI != '1'
                                                      AND hcthCVD.TRANG_THAI != '4')
                                                  OR (
                                                          (hcthCVD.TRANG_THAI = '1'
                                                              OR hcthCVD.TRANG_THAI = '4')
                                                          AND hcthCVD.DON_VI_GUI = '29'
                                                      )
                                                  OR hcthCVD.TRANG_THAI IS NULL
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
                                       (donViXem IS NULL AND canBoXem IS NULL)
                                       OR (donViXem IS NOT NULL AND hcthCVD.DON_VI_GUI IN
                                                                    (
                                                                        SELECT regexp_substr(donViXem, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(donViXem, '[^,]+', 1, level) is NOT NULL
                                                                    )
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
                                       AND hcthCVD.TRANG_THAI != '1'
                                       AND hcthCVD.TRANG_THAI != '4'
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
                                                               (hcthCVD.TRANG_THAI != '1'
                                                                   AND hcthCVD.TRANG_THAI != '4')
                                                               OR (
                                                                       (hcthCVD.TRANG_THAI = '1'
                                                                           OR hcthCVD.TRANG_THAI = '4')
                                                                       AND hcthCVD.DON_VI_GUI = '29'
                                                                   )
                                                               OR hcthCVD.TRANG_THAI IS NULL
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
             );

    RETURN CVD_INFO;
END;

/
--EndMethod--

