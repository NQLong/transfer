CREATE OR REPLACE FUNCTION DT_THOI_KHOA_BIEU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DT_THOI_KHOA_BIEU TKB
             LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
             LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
             LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
             LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC

    WHERE searchTerm = ''
       OR LOWER(TRIM(DMMH.TEN)) LIKE sT
       OR LOWER(TRIM(DV.TEN)) LIKE sT
       OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
       OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
       OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
       OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
       OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT TKB.ID           AS                  "id",
                        TKB.PHONG        AS                  "phong",
                        TKB.THU          AS                  "thu",
                        TKB.TIET_BAT_DAU AS                  "tietBatDau",
                        TKB.SO_TIET      AS                  "soTiet",
                        TKB.HOC_KY       AS                  "hocKy",
                        TKB.NAM          AS                  "nam",
                        TKB.MA_MON_HOC   AS                  "maMonHoc",
                        TKB.NGAY_BAT_DAU AS                  "ngayBatDau",
                        TKB.NHOM         AS                  "nhom",
                        DV.TEN           AS                  "tenKhoaBoMon",
                        DV.MA            AS                  "maKhoaBoMon",
                        DMMH.TEN         AS                  "tenMonHoc",
                        DV1.TEN          AS                  "tenKhoaDangKy",
                        CB.HO            AS                  "hoGiangVien",
                        CB.TEN           AS                  "tenGiangVien",
                        TKB.GIANG_VIEN   as                  "giangVien",
                        TD.VIET_TAT      AS                  "trinhDo",
                        ROW_NUMBER() OVER (ORDER BY TKB.THU) R
                 FROM DT_THOI_KHOA_BIEU TKB
                          LEFT JOIN DM_DON_VI DV1 ON DV1.MA = TKB.KHOA_DANG_KY
                          LEFT JOIN DM_MON_HOC DMMH ON DMMH.MA = TKB.MA_MON_HOC
                          LEFT JOIN DM_DON_VI DV ON DV.MA = DMMH.KHOA
                          LEFT JOIN TCHC_CAN_BO CB on TKB.GIANG_VIEN = CB.SHCC
                          LEFT JOIN DM_NGACH_CDNN NGACH on CB.NGACH = NGACH.MA
                          LEFT JOIN DM_TRINH_DO TD ON TD.MA = CB.HOC_VI
                 WHERE searchTerm = ''
                    OR LOWER(TRIM(DMMH.TEN)) LIKE sT
                    OR LOWER(TRIM(DV.TEN)) LIKE sT
                    OR LOWER(TRIM(TKB.MA_MON_HOC)) LIKE sT
                    OR LOWER(TRIM(TKB.HOC_KY)) LIKE sT
                    OR LOWER('thứ' || ' ' || TRIM(TKB.THU)) LIKE lower(searchTerm)
                    OR LOWER(TRIM(TKB.PHONG)) LIKE lower(searchTerm)
                    OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                 ORDER BY TKB.THU, TKB.KHOA_DANG_KY
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_GET_NOTIFICATION(
    expireTime in number
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT cvd.id          as "id",
               cvd.CAN_BO_NHAN as "maCanBoNhan",

               (SELECT LISTAGG(hcthdvn.DON_VI_NHAN, ',') WITHIN GROUP (
                   order by hcthdvn.ID
                   )ICATION
                FROM HCTH_DON_VI_NHAN hcthdvn
                WHERE hcthdvn.MA = cvd.ID
                  AND hcthdvn.LOAI = 'DEN'
               )               AS "maDonViNhan"
        FROM HCTH_CONG_VAN_DEN cvd
        WHERE cvd.NGAY_HET_HAN is not null
          and cvd.NHAC_NHO = 0
          and cvd.NGAY_HET_HAN < expireTime
          and cvd.TRANG_THAI > 0;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function HCTH_CONG_VAN_DEN_GET_RELATED_STAFF(
    key in NUMBER
) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    canBoNhan STRING(255);
BEGIN
    select cvd.CAN_BO_NHAN into canBoNhan from HCTH_CONG_VAN_DEN cvd where cvd.id = key;

    OPEN my_cursor FOR
        SELECT unique cb.email as "email"
        from TCHC_CAN_BO cb
                 LEFT JOIN QT_CHUC_VU qtcv on qtcv.SHCC = cb.SHCC and qtcv.CHUC_VU_CHINH = 1
        where cb.shcc in (
            select regexp_substr(canBoNhan, '[^,]+', 1, level)
            from dual
            connect by regexp_substr(canBoNhan, '[^,]+', 1, level) is not null
        )
           OR (qtcv.MA_CHUC_VU in ('003', '009') AND qtcv.MA_DON_VI IN (
            SELECT dvn.DON_VI_NHAN
            FROM HCTH_DON_VI_NHAN dvn
            WHERE dvn.LOAI = 'DEN'
              and dvn.MA = key)
            );

    RETURN my_cursor;
END ;

/
--EndMethod--

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
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
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
                        hcthCVD.CAN_BO_NHAN       AS                 "maCanBoNhan",
                        hcthCVD.NOI_BO            AS                 "noiBo",
                        hcthCVD.TRANG_THAI        AS                 "trangThai",
                        hcthCVD.DON_VI_NHAN_NGOAI AS                 "donViNhanNgoai",
                        hcthCVD.SO_DI             AS                 "soDi",
                        hcthCVD.LOAI_CONG_VAN     AS                 "loaiCongVan",
                        dvg.MA                    AS                 "maDonViGui",
                        dvg.TEN                   AS                 "tenDonViGui",
                        dvg.TEN_VIET_TAT         AS                 "tenVietTatDonViGui",

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

DROP FUNCTION HCTH_GIAO_NHIEM_VU_SEARCH_PAGE;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT qtcv.SHCC                    AS                       "shcc",
               qtcv.STT                     AS                       "stt",
               cb.HO                        AS                       "ho",
               cb.TEN                       AS                       "ten",
               cv.PHU_CAP                   AS                       "phuCap",
               qtcv.MA_DON_VI               AS                       "maDonVi",
               dv.TEN                       AS                       "tenDonVi",
               qtcv.MA_BO_MON               AS                       "maBoMon",
               bm.TEN                       AS                       "tenBoMon",
               qtcv.MA_CHUC_VU              AS                       "maChucVu",
               cv.TEN                       AS                       "tenChucVu",
               qtcv.SO_QD                   AS                       "soQuyetDinh",
               cv.LOAI_CHUC_VU              AS                       "loaiChucVu",
               qtcv.NGAY_RA_QD              AS                       "ngayRaQuyetDinh",
               qtcv.CHUC_VU_CHINH           AS                       "chucVuChinh",
               qtcv.THOI_CHUC_VU            AS                       "thoiChucVu",
               qtcv.SO_QD_THOI_CHUC_VU      AS                       "soQdThoiChucVu",
               qtcv.NGAY_THOI_CHUC_VU       AS                       "ngayThoiChucVu",
               qtcv.NGAY_RA_QD_THOI_CHUC_VU AS                       "ngayRaQdThoiChucVu",
               ROW_NUMBER() OVER (ORDER BY qtcv.CHUC_VU_CHINH DESC ) R

        FROM QT_CHUC_VU qtcv
                 LEFT JOIN TCHC_CAN_BO cb ON qtcv.SHCC = cb.SHCC
                 LEFT JOIN DM_CHUC_VU cv ON cv.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI dv ON dv.MA = qtcv.MA_DON_VI
                 LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
        WHERE qtcv.SHCC = isSHCC
        ORDER BY CHUC_VU_CHINH DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_CURRENT_OF_STAFF(iSHCC in string, iTime in NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM (SELECT *
                  FROM QT_DAO_TAO
                  WHERE QT_DAO_TAO.SHCC = iSHCC
                      AND ((KET_THUC = -1)
                     OR (BAT_DAU IS NOT NULL AND KET_THUC IS NOT NULL AND BAT_DAU <= iTime AND KET_THUC >= iTime))
                 ) DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC;
    RETURN my_cursor;
end;

/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_HOC_VI_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.MINH_CHUNG            AS "minhChung",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.TRINH_DO              AS "trinhDo",
               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM QT_DAO_TAO DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC AND DT.KET_THUC != -1;
    RETURN my_cursor;
end;

/
--EndMethod--

DROP FUNCTION QT_DAO_TAO_GET_TRINH_DO_CHINH_TRI_CAN_BO;
/
--EndMethod--

DROP FUNCTION QT_DAO_TAO_GET_TRINH_DO_QLNN_CAN_BO;
/
--EndMethod--

DROP FUNCTION QT_DAO_TAO_GET_TRINH_DO_TIN_HOC_CAN_BO;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_DAO_TAO
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC ) GROUP BY SHCC)) qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        qtdt.ID             as  "id",
                        qtdt.SHCC           as  "shcc",
                        qtdt.TEN_TRUONG     as  "tenTruong",
                        qtdt.CHUYEN_NGANH   as  "chuyenNganh",
                        qtdt.BAT_DAU        as  "batDau",
                        qtdt.BAT_DAU_TYPE   as  "batDauType",
                        qtdt.KET_THUC       as  "ketThuc",
                        qtdt.KET_THUC_TYPE  as  "ketThucType",
                        qtdt.HINH_THUC      as  "hinhThuc",
                        qtdt.LOAI_BANG_CAP  as  "loaiBangCap",
                        qtdt.TRINH_DO       as  "trinhDo",
                        qtdt.KINH_PHI       as  "kinhPhi",

                        (SELECT COUNT(*)
                         FROM QT_DAO_TAO qtdt_temp
                         WHERE qtdt_temp.SHCC = qtdt.SHCC
                           AND (qtdt_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                qtdt_temp.BAT_DAU >= fromYear)
                           AND (qtdt_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                qtdt_temp.KET_THUC <= toYear)
                        ) AS "soQuaTrinh",

                        (Select listagg(qtdt_temp2.CHUYEN_NGANH, '??') within group ( order by null)
                         from QT_DAO_TAO qtdt_temp2
                         where qtdt_temp2.SHCC = qtdt.SHCC
                            AND (qtdt_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                                qtdt_temp2.BAT_DAU >= fromYear)
                           AND (qtdt_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                                qtdt_temp2.KET_THUC <= toYear)
                            ) AS "danhSachChuyenNganh",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        bdt.TEN             as  "tenBDT",
                        htdt.TEN            as  "tenHTDT",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtdt.BAT_DAU ASC) R
                FROM (SELECT *
                        FROM QT_DAO_TAO
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC ) GROUP BY SHCC)) qtdt
                         LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                         LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
                  AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                ORDER BY qtdt.BAT_DAU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       list_shcc IN STRING, list_dv IN STRING,
                                       fromYear IN NUMBER, toYear IN NUMBER, list_loaiBang IN STRING,
                                       searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (list_loaiBang IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR (list_shcc = qtdt.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
            AND (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear))
            AND (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdt.ID                    as             "id",
                        qtdt.SHCC                  as             "shcc",
                        qtdt.TEN_TRUONG            as             "tenCoSoDaoTao",
                        qtdt.CHUYEN_NGANH          as             "chuyenNganh",
                        qtdt.BAT_DAU               as             "batDau",
                        qtdt.BAT_DAU_TYPE          as             "batDauType",
                        qtdt.KET_THUC              as             "ketThuc",
                        qtdt.KET_THUC_TYPE         as             "ketThucType",
                        qtdt.HINH_THUC             as             "hinhThuc",
                        qtdt.LOAI_BANG_CAP         as             "loaiBangCap",
                        qtdt.TRINH_DO              as             "trinhDo",
                        qtdt.KINH_PHI              as             "kinhPhi",

                        cb.TEN                     as             "tenCanBo",
                        cb.HO                      as             "hoCanBo",
                        dv.MA                      AS             "maDonVi",
                        dv.TEN                     AS             "tenDonVi",
                        bdt.TEN                    as             "tenLoaiBangCap",
                        htdt.TEN                   as             "tenHinhThuc",
                        TDDT.TEN                   AS             "tenTrinhDo",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
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
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                         (list_loaiBang IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR
                            (list_shcc = qtdt.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
                         AND (qtdt.BAT_DAU IS NULL OR (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear)))
                         AND (qtdt.KET_THUC IS NULL OR (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999))))))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE ST
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                 ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QUAN_HE_GIA_DINH_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    cur SYS_REFCURSOR;
BEGIN
    OPEN cur FOR
        SELECT
               qhcb.ID AS "id",
               qhcb.HO_TEN AS "hoTen",
               qhcb.MOI_QUAN_HE AS "moiQuanHe",
               dmqh.TEN AS "tenMoiQuanHe",
               qhcb.NAM_SINH AS "namSinh",
               qhcb.NGHE_NGHIEP AS "ngheNghiep",
               qhcb.NOI_CONG_TAC AS "noiCongTac",
               dmqh.LOAI AS "loai",
               qhcb.DIA_CHI AS "diaChi",
               qhcb.QUE_QUAN AS "queQuan"
        FROM QUAN_HE_CAN_BO qhcb
                 LEFT JOIN DM_QUAN_HE_GIA_DINH dmqh ON dmqh.MA = qhcb.MOI_QUAN_HE
        WHERE isSHCC = qhcb.SHCC
    ORDER BY  qhcb.NAM_SINH ;
    return cur;
END;

/
--EndMethod--

