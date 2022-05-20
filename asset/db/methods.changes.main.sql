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
    status     NUMBER(4);
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

