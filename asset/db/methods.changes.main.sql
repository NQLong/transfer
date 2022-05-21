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
    status IN STRING,
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
                              AND EXISTS(
                                    SELECT hcthDVN.id
                                    FROM HCTH_DON_VI_NHAN hcthDVN
                                    WHERE hcthDVN.MA = hcthCVD.ID
                                    AND hcthDVN.LOAI = 'DI'
                                    AND hcthDVN.DON_VI_NHAN IN (
                                            select regexp_substr(donVi, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                        )
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
                                              loaiCongVan = 0
                                          AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                          AND hcthCVD.LOAI_CONG_VAN = 0
                                      )
                                  OR (
                                              loaiCongVan = 1
                                          AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                          AND hcthCVD.LOAI_CONG_VAN = 1
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
                 SELECT hcthCVD.ID                AS                 "id",
                        hcthCVD.TRICH_YEU         AS                 "trichYeu",
                        hcthCVD.NGAY_GUI          AS                 "ngayGui",
                        hcthCVD.NGAY_KY           AS                 "ngayKy",
                        hcthCVD.CAN_BO_NHAN       AS                 "maCanBoNhan",
                        hcthCVD.TRANG_THAI        AS                 "trangThai",
                        hcthCVD.DON_VI_NHAN_NGOAI AS                 "donViNhanNgoai",
                        hcthCVD.LOAI_CONG_VAN     AS                 "loaiCongVan",
                        hcthCVD.SO_CONG_VAN       AS                 "soCongVan",
                        hcthCVD.LOAI_VAN_BAN      AS                 "loaiVanBan",
                        dvg.MA                    AS                 "maDonViGui",
                        dvg.TEN                   AS                 "tenDonViGui",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                    ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = hcthCVD.ID
                            AND hcthDVN.LOAI = 'DI'
                        )   AS "maDonViNhan",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = hcthCVD.ID
                            AND hcthDVN.LOAI = 'DI'
                        ) AS "danhSachDonViNhan",

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

                    ROW_NUMBER() OVER (ORDER BY hcthCVD.ID DESC) R
                 FROM HCTH_CONG_VAN_DI hcthCVD
                          LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
                 WHERE  (
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
                                          AND EXISTS(
                                                SELECT hcthDVN.id
                                                FROM HCTH_DON_VI_NHAN hcthDVN
                                                WHERE hcthDVN.MA = hcthCVD.ID
                                                AND hcthDVN.LOAI = 'DI'
                                                AND hcthDVN.DON_VI_NHAN IN (
                                                        select regexp_substr(donVi, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(donVi, '[^,]+', 1, level) is not null
                                                    )
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
                                                          loaiCongVan = 0
                                                      AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                      AND hcthCVD.LOAI_CONG_VAN = 0
                                                  )
                                              OR (
                                                          loaiCongVan = 1
                                                      AND hcthCVD.LOAI_CONG_VAN IS NOT NULL
                                                      AND hcthCVD.LOAI_CONG_VAN = 1
                                                  )
                                          )
                                  )
--                               AND (
--                                         congVanLaySo IS NULL
--                                     OR (
--                                             (
--                                                     congVanLaySo = 1
--                                                 AND hcthCVD.LAY_SO IS NOT NULL
--                                                 AND hcthCVD.LAY_SO = 1
--                                                 )
--                                             OR (
--                                                     congVanLaySo = 2
--                                                 AND hcthCVD.LAY_SO IS NOT NULL
--                                                 AND hcthCVD.LAY_SO = 0
--                                                 )
--                                             )
--                                   )
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
      and (fromTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI > fromTime))
      AND (toTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI < toTime))
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
                and (fromTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI > fromTime))
                AND (toTime is null or (hcthcvd.NGAY_GUI is not null and hcthcvd.NGAY_GUI < toTime))
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

CREATE OR REPLACE FUNCTION HCTH_GIAO_NHIEM_VU_GET_ALL_CAN_BO_NHAN(
    nhiemVuId IN NUMBER
)   RETURN SYS_REFCURSOR AS
my_cursor SYS_REFCURSOR;
BEGIN

OPEN my_cursor FOR
SELECT
    hcthcbn.ID               as  "id",
    hcthcbn.CAN_BO_NHAN      as  "canBoNhan",
    hcthcbn.NGUOI_TAO        as  "nguoiTao",

CASE when hcthcbn.CAN_BO_NHAN is not null then
(
                SELECT LISTAGG(
                        CASE
                            WHEN cb.HO IS NULL THEN cb.TEN
                            WHEN cb.TEN IS NULL THEN cb.HO
                            ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                        END,
                        '; '
                    ) WITHIN GROUP (
                        order by cb.TEN
                    )
                FROM TCHC_CAN_BO cb
                WHERE INSTR(CONCAT(hcthcbn.CAN_BO_NHAN,','), CONCAT(cb.shcc, ',')) != 0
) END AS "danhSachCanBoNhan",
CASE when hcthcbn.NGUOI_TAO is not null then
(
    SELECT (
        CASE
            WHEN cb.HO IS NULL THEN cb.TEN
            WHEN cb.TEN IS NULL THEN cb.HO
            ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
        END
    )
    FROM TCHC_CAN_BO cb
    WHERE hcthcbn.NGUOI_TAO = cb.SHCC
) END AS "tenNguoiTao"
FROM HCTH_CAN_BO_NHAN hcthcbn
WHERE (nhiemVuId is not null and hcthcbn.MA=nhiemVuId and hcthcbn.LOAI = 'NHIEM_VU')
ORDER BY hcthcbn.ID;
RETURN my_cursor;
END;

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

               hcthcvdi.TRICH_YEU      as "trichYeuDi"
        FROM HCTH_LIEN_KET lk
                 LEFT JOIN HCTH_CONG_VAN_DEN hcthcvden ON hcthcvden.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DEN'
                 LEFT JOIN HCTH_CONG_VAN_DI hcthcvdi ON hcthcvdi.ID = lk.KEY_B and lk.LOAI_B = 'CONG_VAN_DI'
        WHERE (targetA is null or lk.KEY_A = targetA)
          and (targetTypeA is null or lk.LOAI_A = targetTypeA)
          and (targetB is null or lk.KEY_B = targetB)
          and (targetTypeB is null or lk.LOAI_B = targetTypeB);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      filter IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(200);
    listDv       STRING(100);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    listLoaiBang STRING(100);
BEGIN

    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiBang') INTO listLoaiBang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_DAO_TAO
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC) GROUP BY SHCC)) qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
      AND (listLoaiBang IS NULL OR
           (listLoaiBang IS NOT NULL AND qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDv IS NULL OR
           (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdt.ID                                 as "id",
                     qtdt.SHCC                               as "shcc",
                     qtdt.TEN_TRUONG                         as "tenTruong",
                     qtdt.CHUYEN_NGANH                       as "chuyenNganh",
                     qtdt.BAT_DAU                            as "batDau",
                     qtdt.BAT_DAU_TYPE                       as "batDauType",
                     qtdt.KET_THUC                           as "ketThuc",
                     qtdt.KET_THUC_TYPE                      as "ketThucType",
                     qtdt.HINH_THUC                          as "hinhThuc",
                     qtdt.LOAI_BANG_CAP                      as "loaiBangCap",
                     qtdt.TRINH_DO                           as "trinhDo",
                     qtdt.KINH_PHI                           as "kinhPhi",
                     qtdt.MINH_CHUNG                         as "minhChung",
                     (SELECT COUNT(*)
                      FROM QT_DAO_TAO qtdt_temp
                      WHERE qtdt_temp.SHCC = qtdt.SHCC
                        AND (qtdt_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                             qtdt_temp.BAT_DAU >= fromYear)
                        AND (qtdt_temp.KET_THUC IS NULL OR toYear IS NULL OR
                             qtdt_temp.KET_THUC <= toYear))  AS "soQuaTrinh",

                     (Select listagg(qtdt_temp2.CHUYEN_NGANH, '??') within group ( order by null)
                      from QT_DAO_TAO qtdt_temp2
                      where qtdt_temp2.SHCC = qtdt.SHCC
                        AND (qtdt_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                             qtdt_temp2.BAT_DAU >= fromYear)
                        AND (qtdt_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                             qtdt_temp2.KET_THUC <= toYear)) AS "danhSachChuyenNganh",

                     cb.TEN                                  as "tenCanBo",
                     cb.HO                                   as "hoCanBo",
                     dv.MA                                   AS "maDonVi",
                     dv.TEN                                  AS "tenDonVi",
                     bdt.TEN                                 as "tenBDT",
                     htdt.TEN                                as "tenHTDT",

                     cv.MA                                   AS "maChucVu",
                     cv.TEN                                  AS "tenChucVu",

                     td.MA                                   AS "maHocVi",
                     td.TEN                                  AS "tenHocVi",

                     cdnn.MA                                 AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtdt.BAT_DAU)  R
              FROM (SELECT *
                    FROM QT_DAO_TAO
                    WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC) GROUP BY SHCC)) qtdt
                       LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                       LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                       LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
                AND (listLoaiBang IS NULL OR
                     (listLoaiBang IS NOT NULL AND
                      qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDv IS NULL OR
                     (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
              ORDER BY qtdt.BAT_DAU)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                       searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor    SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc     STRING(200);
    listDv       STRING(100);
    fromYear     NUMBER(20);
    toYear       NUMBER(20);
    listLoaiBang STRING(100);

BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiBang') INTO listLoaiBang FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DAO_TAO qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
             LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
             LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
      AND (listLoaiBang IS NULL OR
           (listLoaiBang IS NOT NULL AND qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                                                from dual
                                                                connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDv IS NULL OR
           (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdt.ID            as                     "id",
                     qtdt.SHCC          as                     "shcc",
                     qtdt.TEN_TRUONG    as                     "tenTruong",
                     qtdt.CHUYEN_NGANH  as                     "chuyenNganh",
                     qtdt.BAT_DAU       as                     "batDau",
                     qtdt.BAT_DAU_TYPE  as                     "batDauType",
                     qtdt.KET_THUC      as                     "ketThuc",
                     qtdt.KET_THUC_TYPE as                     "ketThucType",
                     qtdt.HINH_THUC     as                     "hinhThuc",
                     qtdt.LOAI_BANG_CAP as                     "loaiBangCap",
                     qtdt.TRINH_DO      as                     "trinhDo",
                     qtdt.KINH_PHI      as                     "kinhPhi",
                     qtdt.MINH_CHUNG    as                     "minhChung",
                     cb.TEN             as                     "tenCanBo",
                     cb.HO              as                     "hoCanBo",
                     dv.MA              AS                     "maDonVi",
                     dv.TEN             AS                     "tenDonVi",
                     bdt.TEN            as                     "tenLoaiBangCap",
                     htdt.TEN           as                     "tenHinhThuc",
                     TDDT.TEN           AS                     "tenTrinhDo",

                     cv.MA              AS                     "maChucVu",
                     cv.TEN             AS                     "tenChucVu",

                     td.MA              AS                     "maHocVi",
                     td.TEN             AS                     "tenHocVi",

                     cdnn.MA            AS                     "maChucDanhNgheNghiep",
                     cdnn.TEN           AS                     "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtdt.ID DESC) R
              FROM QT_DAO_TAO qtdt
                       LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                       LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                       LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                       LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtdt.BAT_DAU IS NOT NULL AND qtdt.BAT_DAU >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtdt.KET_THUC IS NOT NULL AND qtdt.KET_THUC <= toYear + 86399999)))
                AND (listLoaiBang IS NULL OR
                     (listLoaiBang IS NOT NULL AND
                      qtdt.LOAI_BANG_CAP IN (SELECT regexp_substr(listLoaiBang, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listLoaiBang, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtdt.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDv IS NULL OR
                     (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(listDv, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
              ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                filter IN STRING, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING (100);
    listDv STRING (100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_DON_VI_TRA_LUONG
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC) GROUP BY SHCC)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.SHCC AS                   "shcc",
                        hd.ID              AS                   "id",
                        benA.HO            AS                   "hoBenA",
                        benA.TEN           AS                   "tenBenA",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH = cdcm.MA
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((listShcc IS NOT NULL AND
                                  ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
                                OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                                OR (listShcc IS NULL AND listDv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",

                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.SHCC = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DON_VI_TRA_LUONG = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.NGACH = ncdnn.ID
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH = cdcm.MA
                        WHERE (hd_temp.SHCC = hd.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((listShcc IS NOT NULL AND
                                  ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
                                OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                                OR (listShcc IS NULL AND listDv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.SHCC) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",

                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG, benA.TEN DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_DON_VI_TRA_LUONG
                       WHERE ID IN
                             (SELECT MAX(ID)
                              FROM (SELECT * FROM QT_HOP_DONG_DON_VI_TRA_LUONG ORDER BY ID DESC)
                              GROUP BY SHCC)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.SHCC = benA.SHCC
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                                         totalItem OUT NUMBER,
                                                         pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING (100);
    listDv STRING (100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH cdcm on hd.CHUC_DANH = cdcm.MA
    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((listShcc IS NOT NULL AND
              ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR (listShcc = benA.SHCC)))
            OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.SHCC) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.SHCC              AS                 "shcc",
                     hd.ID                AS                 "ID",
                     benA.HO              AS                 "hoBenA",
                     benA.TEN             AS                 "tenBenA",
                     nguoiKy.SHCC         as                 "shccNguoiKy",
                     nguoiKy.HO           as                 "hoNguoiKy",
                     nguoiKy.TEN          as                 "tenNguoiKy",
                     nguoiKy.MA_CHUC_VU   as                 "chucVuNguoiKy",
                     nguoiKy.MA_DON_VI    as                 "donviNguoiKy",
                     hd.SO_HOP_DONG       as                 "soHopDong",
                     hd.LOAI_HOP_DONG     as                 "loaiHopDong",
                     dhd.TEN              as                 "tenLoaiHopDong",
                     hd.BAT_DAU_LAM_VIEC  as                 "batDauLamViec",
                     hd.KET_THUC_HOP_DONG as                 "ketThucHopDong",
                     hd.NGAY_TAI_KY       as                 "ngayTaiKy",
                     hd.DON_VI_TRA_LUONG  as                 "diaDiemLamViec",
                     dv.TEN               as                 "tenDiaDiemLamViec",
                     hd.CHUC_DANH         as                 "chucDanhChuyenMon",
                     cdcm.TEN             as                 "tenChucDanhChuyenMon",
                     hd.NGACH             as                 "maNgach",
                     hd.BAC               as                 "bac",
                     hd.HE_SO             as                 "heSo",
                     hd.NGAY_KY_HOP_DONG  as                 "ngayKyHopDong",
                     hd.PHAN_TRAM_HUONG   as                 "phanTramHuong",
                     ROW_NUMBER() OVER (ORDER BY hd.ID DESC) R
              FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
                       LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                       LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                       LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
                       LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
                       LEFT JOIN DM_CHUC_DANH cdcm on hd.CHUC_DANH = cdcm.MA
              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((listShcc IS NOT NULL AND
                        ((INSTR(listShcc, ',') != 0 AND INSTR(listShcc, benA.SHCC) != 0) OR
                         (listShcc = benA.SHCC)))
                      OR (listDv IS NOT NULL AND INSTR(listDv, benA.MA_DON_VI) != 0)
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                      AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND
                           (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                AND (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.SHCC) LIKE sT
                  OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                  OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

