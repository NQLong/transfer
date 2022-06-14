CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
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
                                  (select regexp_substr(listDonVi, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)
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
                          (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                           from dual
                           connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
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
        FROM (SELECT hcthcvd.ID                                                                                                     AS "id",
                     hcthcvd.SO_DEN                                                                                                 AS "soDen",
                     hcthcvd.NGAY_NHAN                                                                                              AS "ngayNhan",
                     hcthcvd.TRICH_YEU                                                                                              AS "trichYeu",
                     hcthcvd.NGAY_CONG_VAN                                                                                          AS "ngayCongVan",
                     hcthcvd.NGAY_HET_HAN                                                                                           AS "ngayHetHan",
                     hcthcvd.SO_CONG_VAN                                                                                            AS "soCongVan",
                     hcthcvd.CAN_BO_NHAN                                                                                            AS "maCanBoNhan",
                     hcthcvd.TRANG_THAI                                                                                             AS "trangThai",
                     dvgcv.ID                                                                                                       AS "maDonViGuiCV",
                     dvgcv.TEN                                                                                                      AS "tenDonViGuiCV",
                     hcthcvd.CAP_NHAT_LUC                                                                                           AS "capNhatLuc",


                     (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                         order by hcthdvn.ID
                         )
                      FROM HCTH_DON_VI_NHAN hcthdvn
                      WHERE hcthdvn.MA = hcthcvd.ID
                        AND hcthdvn.LOAI = 'DEN')                                                                                   AS "maDonViNhan",


                     (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                         order by dvn.TEN
                         )
                      FROM DM_DON_VI dvn
                               LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                      WHERE hcthdvn.MA = hcthcvd.ID
                        AND hcthdvn.LOAI = 'DEN')                                                                                   AS "danhSachDonViNhan",


                     CASE
                         when hcthcvd.CAN_BO_NHAN is not null then
                             (SELECT LISTAGG(
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
                                                 connect by regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level) is not null)) END AS "danhSachCanBoNhan",


                     CASE
                         WHEN EXISTS(SELECT id
                                     FROM HCTH_CHI_DAO cd
                                     WHERE cd.CONG_VAN = hcthcvd.ID
                                       and cd.LOAI = 'DEN') then 1
                         ELSE 0
                         END                                                                                                        as "hasChiDao",

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
                                         when sortBy = 'CAP_NHAT' then hcthcvd.CAP_NHAT_LUC

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
                                         when sortBy = 'CAP_NHAT' then hcthcvd.CAP_NHAT_LUC
                                         ELSE 0 END
                                 ELSE 0 END,
                             hcthcvd.ID DESC
                         )                                                                                                             R
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
                                  (select regexp_substr(hcthcvd.CAN_BO_NHAN, '[^,]+', 1, level)
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
                                            (select regexp_substr(listDonVi, '[^,]+', 1, level)
                                             from dual
                                             connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)
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
                                    (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                     from dual
                                     connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
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
                  ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_HISTORY_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING,
    sortType in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT distinct hs.ID        as "id",
                        hs.SHCC      as "shcc",
                        hs.GHI_CHU   as "ghiChu",
                        hs.HANH_DONG as "hanhDong",
                        hs.THOI_GIAN as "thoiGian",
                        cb.HO        as "ho",
                        cb.TEN       as "ten",
                        DMCV.TEN     as "chucVu",
                        usr.IMAGE    AS "image"


        FROM HCTH_HISTORY hs
                 LEFT JOIN TCHC_CAN_BO cb on hs.SHCC = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc


        WHERE (target is not null and hs.KEY = target and loai is not null and targetType = hs.loai)
        ORDER BY
                 case
                     WHEN sortType = 'ASC' then hs.THOI_GIAN
                         ElSE 0 END,
                 hs.THOI_GIAN DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

