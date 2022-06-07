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
            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
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
                        CT.NAM_DAO_TAO       as            "namHoc",
                        dtDangKyMoMon.THOI_GIAN as            "thoiGian",
                        dtDangKyMoMon.GHI_CHU   as            "ghiChu",
                        dtDangKyMoMon.ID        as            "id",
                        dtDangKyMoMon.IS_DUYET  as            "isDuyet",
                        dmDv.TEN                as            "tenKhoaBoMon",
                        dtDangKyMoMon.MA_NGANH  as            "maNganh",
                        ds.TEN_NGANH            as            "tenNganh",
                        ROW_NUMBER() OVER (ORDER BY dmDv.TEN) R
                 FROM DT_DANG_KY_MO_MON dtDangKyMoMon
            LEFT JOIN DT_CAU_TRUC_KHUNG_DAO_TAO CT ON CT.ID = dtDangKyMoMon.NAM
                          LEFT JOIN DM_DON_VI dmDv ON dmDv.MA = dtDangKyMoMon.KHOA
                          LEFT JOIN DT_NGANH_DAO_TAO ds ON ds.MA_NGANH = dtDangKyMoMon.MA_NGANH
                 WHERE (donVi IS NULL OR donVi = dmDv.MA)
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

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

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER,
                                                searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAI_VIET_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbvkh.ID                                        AS "id",
                     qtbvkh.SHCC                                      AS "shcc",
                     (SELECT COUNT(*)
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "soBaiViet",

                     (select rtrim(xmlagg(xmlelement(e, qtbvkh_temp.TEN_BAI_VIET || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "danhSachBaiViet",

                     (select rtrim(xmlagg(xmlelement(e, qtbvkh_temp.NAM_XUAT_BAN || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (xuatBanRange IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                              AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND
                                   (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))
                              AND (xuatBanRange IS NULL OR
                                   (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                          OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                          OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)) AS "danhSachNamXuatBan",

                     cb.HO                                            AS "hoCanBo",
                     cb.TEN                                           AS "tenCanBo",

                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC)      R
              FROM (SELECT *
                    FROM QT_BAI_VIET_KHOA_HOC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtbvkh
                       LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtbvkh.NAM_XUAT_BAN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 list_shcc IN STRING, list_dv IN STRING,
                                                 fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER,
                                                 searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAI_VIET_KHOA_HOC qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (xuatBanRange IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
            AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))
            AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
        OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
        OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
        OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbvkh.ID                 AS                   "id",
                     qtbvkh.TEN_TAC_GIA        AS                   "tenTacGia",
                     qtbvkh.NAM_XUAT_BAN       AS                   "namXuatBan",
                     qtbvkh.TEN_BAI_VIET       AS                   "tenBaiViet",
                     qtbvkh.TEN_TAP_CHI        AS                   "tenTapChi",
                     qtbvkh.SO_HIEU_ISSN       AS                   "soHieuIssn",
                     qtbvkh.SAN_PHAM           AS                   "sanPham",
                     qtbvkh.DIEM_IF            AS                   "diemIf",
                     qtbvkh.QUOC_TE            AS                   "quocTe",
                     qtbvkh.SHCC               AS                   "shcc",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
              FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                       LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (xuatBanRange IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
                      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))
                      AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
                  OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
                  OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
                  OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT)
              ORDER BY qtbvkh.NAM_XUAT_BAN DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_BANG_PHAT_MINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC) GROUP BY SHCC)) qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbpm.ID                                     AS "id",
                     qtbpm.SHCC                                   AS "shcc",

                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_BANG_PHAT_MINH qtbpm_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND
                                    (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND
                                   (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                          OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                          OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                          OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)) AS "soBang",

                     (select rtrim(xmlagg(xmlelement(e, qtbpm_temp.TEN_BANG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_BANG_PHAT_MINH qtbpm_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND
                                    (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND
                                   (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                          OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                          OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                          OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)) AS "danhSachTenBang",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",

                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC)       R
              FROM (SELECT *
                    FROM QT_BANG_PHAT_MINH
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtbpm
                       LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtbpm.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              list_shcc IN STRING, list_dv IN STRING,
                                              fromYear IN NUMBER, toYear IN NUMBER,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BANG_PHAT_MINH qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                 (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbpm.TEN_BANG) LIKE sT
        OR LOWER(qtbpm.SO_HIEU) LIKE sT
        OR LOWER(qtbpm.TAC_GIA) LIKE sT
        OR LOWER(qtbpm.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtbpm.ID                  AS              "id",
                     qtbpm.SHCC                AS              "shcc",
                     qtbpm.TEN_BANG            AS              "tenBang",
                     qtbpm.SO_HIEU             AS              "soHieu",
                     qtbpm.NAM_CAP             AS              "namCap",
                     qtbpm.NOI_CAP             AS              "noiCap",
                     qtbpm.TAC_GIA             AS              "tacGia",
                     qtbpm.SAN_PHAM            AS              "sanPham",
                     qtbpm.LOAI_BANG           AS              "loaiBang",

                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
              FROM QT_BANG_PHAT_MINH qtbpm
                       LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                           (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtbpm.TEN_BANG) LIKE sT
                  OR LOWER(qtbpm.SO_HIEU) LIKE sT
                  OR LOWER(qtbpm.TAC_GIA) LIKE sT
                  OR LOWER(qtbpm.SAN_PHAM) LIKE sT)
              ORDER BY qtbpm.NOI_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                  tinhTrang IN NUMBER,
                                                  loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_CONG_TAC_TRONG_NUOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtcttn.ID                            AS   "id",
                     qtcttn.SHCC                          AS   "shcc",

                     (SELECT COUNT(*)
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachBatDauType",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC_TYPE || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, DMDTN.MO_TA || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                      WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                              AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND
                                          (qtcttn_temp.BAT_DAU IS NOT NULL AND
                                           (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND
                                               (qtcttn_temp.KET_THUC IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR qtcttn_temp.KET_THUC <= toYear)
                                       ) OR (
                                               timeType = 2
                                           AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                       ))
                              AND (tinhTrang IS NULL OR (qtcttn_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtcttn_temp.BAT_DAU <= today AND qtcttn_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                          OR LOWER(DMDTN.MO_TA) LIKE sT)) AS   "danhSachMucDich",

                     today                                AS   "today",
                     cb.HO                                AS   "hoCanBo",
                     cb.TEN                               AS   "tenCanBo",

                     dv.MA                                AS   "maDonVi",
                     dv.TEN                               AS   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS   "maChucVu",

                     td.MA                                AS   "maHocVi",
                     td.TEN                               AS   "tenHocVi",

                     cdnn.MA                              AS   "maChucDanhNgheNghiep",
                     cdnn.TEN                             AS   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_CONG_TAC_TRONG_NUOC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtcttn
                       LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtcttn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   list_shcc IN STRING, list_dv IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   tinhTrang IN NUMBER,
                                                   loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CONG_TAC_TRONG_NUOC qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
            AND (timeType IS NULL OR (
                        timeType = 0 AND
                        (qtcttn.BAT_DAU IS NOT NULL AND
                         (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                ) OR (
                             timeType = 1 AND
                             (qtcttn.KET_THUC IS NOT NULL AND
                              (fromYear IS NULL OR qtcttn.KET_THUC >= fromYear)) AND
                             (toYear IS NULL OR qtcttn.KET_THUC <= toYear)
                     ) OR (
                             timeType = 2
                         AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND
                              (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                         AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                     ))
            AND (tinhTrang IS NULL OR (qtcttn.BAT_DAU > today AND tinhTrang = 3) OR
                 (qtcttn.BAT_DAU <= today AND qtcttn.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtcttn.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcttn.LY_DO) LIKE sT
        OR LOWER(DMDTN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtcttn.ID                                    AS "id",
                     qtcttn.LY_DO                                 AS "lyDo",
                     qtcttn.NOI_DEN                               AS "noiDen",
                     qtcttn.SHCC                                  AS "shcc",
                     qtcttn.VIET_TAT                              AS "vietTat",
                     qtcttn.BAT_DAU                               AS "batDau",
                     qtcttn.BAT_DAU_TYPE                          AS "batDauType",
                     qtcttn.KET_THUC                              AS "ketThuc",
                     qtcttn.KET_THUC_TYPE                         AS "ketThucType",
                     qtcttn.KINH_PHI                              AS "kinhPhi",
                     qtcttn.GHI_CHU                               AS "ghiChu",
                     qtcttn.SO_CV                                 AS "soCv",
                     qtcttn.NGAY_QUYET_DINH                       AS "ngayQuyetDinh",

                     (select rtrim(xmlagg(xmlelement(e, dmttp.TEN, ', ').extract('//text()') order by
                                          null).getclobval(), ', ')
                      FROM DM_TINH_THANH_PHO dmttp
                      WHERE INSTR(qtcttn.NOI_DEN, dmttp.MA) != 0) AS "danhSachTinh",

                     today                                        AS "today",
                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",
                     DMDTN.MO_TA                                  AS "tenMucDich",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",

                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC)       R
              FROM QT_CONG_TAC_TRONG_NUOC qtcttn
                       LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                      AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (qtcttn.BAT_DAU IS NOT NULL AND
                                   (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND
                                       (qtcttn.KET_THUC IS NOT NULL AND
                                        (fromYear IS NULL OR qtcttn.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR qtcttn.KET_THUC <= toYear)
                               ) OR (
                                       timeType = 2
                                   AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                               ))
                      AND (tinhTrang IS NULL OR (qtcttn.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtcttn.BAT_DAU <= today AND qtcttn.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtcttn.KET_THUC < today AND tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtcttn.LY_DO) LIKE sT
                  OR LOWER(DMDTN.MO_TA) LIKE sT)
              ORDER BY qtcttn.BAT_DAU DESC)
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
        FROM (SELECT qtdt.ID                   as              "id",
                     qtdt.SHCC                 as              "shcc",
                     qtdt.TEN_TRUONG           as              "tenTruong",
                     qtdt.CHUYEN_NGANH         as              "chuyenNganh",
                     qtdt.BAT_DAU              as              "batDau",
                     qtdt.BAT_DAU_TYPE         as              "batDauType",
                     qtdt.KET_THUC             as              "ketThuc",
                     qtdt.KET_THUC_TYPE        as              "ketThucType",
                     qtdt.HINH_THUC            as              "hinhThuc",
                     qtdt.LOAI_BANG_CAP        as              "loaiBangCap",
                     qtdt.TRINH_DO             as              "trinhDo",
                     qtdt.KINH_PHI             as              "kinhPhi",
                     qtdt.MINH_CHUNG           as              "minhChung",
                     cb.TEN                    as              "tenCanBo",
                     cb.HO                     as              "hoCanBo",
                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     bdt.TEN                   as              "tenLoaiBangCap",
                     htdt.TEN                  as              "tenHinhThuc",
                     TDDT.TEN                  AS              "tenTrinhDo",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtdt.ID DESC) R
              FROM QT_DAO_TAO qtdt
                       LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                       LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                       LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
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

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                                         AS      "id",
                     qtdnn.NOI_DUNG                                   AS      "noiDung",
                     qtdnn.QUOC_GIA                                   AS      "quocGia",
                     qtdnn.SHCC                                       AS      "shcc",
                     qtdnn.MUC_DICH                                   AS      "mucDich",
                     qtdnn.NGAY_DI                                    AS      "ngayDi",
                     qtdnn.NGAY_DI_TYPE                               AS      "ngayDiType",
                     qtdnn.NGAY_VE                                    AS      "ngayVe",
                     qtdnn.NGAY_VE_TYPE                               AS      "ngayVeType",
                     qtdnn.CHI_PHI                                    AS      "chiPhi",
                     qtdnn.GHI_CHU                                    AS      "ghiChu",
                     qtdnn.SO_QUYET_DINH                              AS      "soQuyetDinh",
                     qtdnn.NGAY_QUYET_DINH                            AS      "ngayQuyetDinh",
                     qtdnn.SO_QD_TIEP_NHAN                            AS      "soQdTiepNhan",
                     qtdnn.NOI_DUNG_TIEP_NHAN                         AS      "noiDungTiepNhan",
                     tnvn.TEN                                         AS      "tenNoiDungTiepNhan",
                     qtdnn.NGAY_QD_TIEP_NHAN                          AS      "ngayQdTiepNhan",
                     qtdnn.NGAY_VE_NUOC                               AS      "ngayVeNuoc",
                     qtdnn.BAO_CAO_TINH_TRANG                         AS      "baoCaoTinhTrang",
                     qtdnn.BAO_CAO_TEN                                AS      "baoCaoTen",
                     qtdnn.BAO_CAO_LY_DO_TRA_VE                       AS      "baoCaoLyDoTraVe",

                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by
                                          null).getclobval(), ' - ')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0) AS      "danhSachQuocGia",

                     today                                            AS      "today",
                     cb.HO                                            AS      "hoCanBo",
                     cb.TEN                                           AS      "tenCanBo",
                     cb.NGAY_SINH                                     AS      "ngaySinh",
                     cb.PHAI                                          AS      "phai",

                     dv.MA                                            AS      "maDonVi",
                     dv.TEN                                           AS      "tenDonVi",
                     DMDNN.MO_TA                                      AS      "tenMucDich",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "maChucVu",
                     td.MA                                            AS      "maHocVi",
                     td.TEN                                           AS      "tenHocVi",

                     cdnn.MA                                          AS      "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS      "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM QT_DI_NUOC_NGOAI qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                      (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                      AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                      AND (timeType IS NULL OR (
                                  timeType = 1 AND
                                  (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                  (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                          ) OR (
                                       timeType = 2
                                   AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                               ) OR (
                                       timeType = 3
                                   AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                               ) OR (
                                       timeType = 4
                                   AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                               ))
                      AND (tinhTrangCongTac IS NULL OR
                           (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                                TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                                30)) OR
                           (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                            TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                           (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                           (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                      AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                         ))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                  OR LOWER(DMDNN.MO_TA) LIKE sT)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            filter IN STRING, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_DI_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                             AS                  "id",
                     qtdnn.SHCC                           AS                  "shcc",

                     (SELECT COUNT(*)
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayDi",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayDiType",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayVe",

                     (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachNgayVeType",

                     (select rtrim(xmlagg(xmlelement(e, DMDNN.MO_TA || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_DI_NUOC_NGOAI qtdnn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                              (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                              AND (mucDich IS NULL OR
                                   qtdnn_temp.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                              AND (timeType IS NULL OR (
                                          timeType = 1 AND
                                          (qtdnn_temp.NGAY_DI IS NOT NULL AND
                                           (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                          (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                  ) OR (
                                               timeType = 2
                                           AND (qtdnn_temp.NGAY_VE IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_VE >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_VE <= toYear)
                                       ) OR (
                                               timeType = 3
                                           AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                       ) OR (
                                               timeType = 4
                                           AND (qtdnn_temp.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                                (fromYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN >= fromYear))
                                           AND (toYear IS NULL OR qtdnn_temp.NGAY_QD_TIEP_NHAN <= toYear)
                                       ))
                              AND (tinhTrangCongTac IS NULL OR
                                   (tinhTrangCongTac = 1 AND qtdnn_temp.NGAY_VE < today and
                                    (qtdnn_temp.SO_QD_TIEP_NHAN IS NOT NULL OR
                                     TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) <
                                     30)) OR
                                   (tinhTrangCongTac = 2 AND qtdnn_temp.NGAY_VE < today and
                                    qtdnn_temp.SO_QD_TIEP_NHAN IS NULL and
                                    TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn_temp.NGAY_VE - qtdnn_temp.NGAY_DI)) >= 30) OR
                                   (tinhTrangCongTac = 3 AND qtdnn_temp.NGAY_VE >= today AND
                                    qtdnn_temp.NGAY_DI <= today) OR
                                   (tinhTrangCongTac = 4 AND qtdnn_temp.NGAY_DI > today))
                              AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn_temp.BAO_CAO_TINH_TRANG)
                                 ))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtdnn_temp.NOI_DUNG_TIEP_NHAN) LIKE sT
                          OR LOWER(DMDNN.MO_TA) LIKE sT)) AS                  "danhSachMucDich",

                     today                                AS                  "today",
                     cb.HO                                AS                  "hoCanBo",
                     cb.TEN                               AS                  "tenCanBo",

                     dv.MA                                AS                  "maDonVi",
                     dv.TEN                               AS                  "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS                  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)            AS                  "maChucVu",
                     td.MA                                AS                  "maHocVi",
                     td.TEN                               AS                  "tenHocVi",

                     cdnn.MA                              AS                  "maChucDanhNgheNghiep",
                     cdnn.TEN                             AS                  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM (SELECT *
                    FROM QT_DI_NUOC_NGOAI
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             filter IN STRING, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor        SYS_REFCURSOR;
    sT               STRING(500) := '%' || lower(searchTerm) || '%';
    today            NUMBER(20);
    list_shcc        STRING(100);
    list_dv          STRING(100);
    fromYear         NUMBER;
    toYear           NUMBER;
    timeType         NUMBER;
    loaiHocVi        STRING(100);
    mucDich          STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao  NUMBER;
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHocVi') INTO loaiHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.mucDich') INTO mucDich FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangCongTac') INTO tinhTrangCongTac FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrangBaoCao') INTO tinhTrangBaoCao FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DI_NUOC_NGOAI qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND
            (tinhTrangBaoCao IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
            AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
            AND (timeType IS NULL OR (
                        timeType = 1 AND
                        (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                        (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                ) OR (
                             timeType = 2
                         AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                     ) OR (
                             timeType = 3
                         AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                              (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                     ) OR (
                             timeType = 4
                         AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                              (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                         AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                     ))
            AND (tinhTrangCongTac IS NULL OR
                 (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                      TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                      30)) OR
                 (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                  TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                 (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                 (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
            AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
               ))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
        OR LOWER(DMDNN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtdnn.ID                                         AS      "id",
                     qtdnn.NOI_DUNG                                   AS      "noiDung",
                     qtdnn.QUOC_GIA                                   AS      "quocGia",
                     qtdnn.SHCC                                       AS      "shcc",
                     qtdnn.MUC_DICH                                   AS      "mucDich",
                     qtdnn.NGAY_DI                                    AS      "ngayDi",
                     qtdnn.NGAY_DI_TYPE                               AS      "ngayDiType",
                     qtdnn.NGAY_VE                                    AS      "ngayVe",
                     qtdnn.NGAY_VE_TYPE                               AS      "ngayVeType",
                     qtdnn.CHI_PHI                                    AS      "chiPhi",
                     qtdnn.GHI_CHU                                    AS      "ghiChu",
                     qtdnn.SO_QUYET_DINH                              AS      "soQuyetDinh",
                     qtdnn.NGAY_QUYET_DINH                            AS      "ngayQuyetDinh",
                     qtdnn.SO_QD_TIEP_NHAN                            AS      "soQdTiepNhan",
                     qtdnn.NOI_DUNG_TIEP_NHAN                         AS      "noiDungTiepNhan",
                     tnvn.TEN                                         AS      "tenNoiDungTiepNhan",
                     qtdnn.NGAY_QD_TIEP_NHAN                          AS      "ngayQdTiepNhan",
                     qtdnn.NGAY_VE_NUOC                               AS      "ngayVeNuoc",
                     qtdnn.BAO_CAO_TINH_TRANG                         AS      "baoCaoTinhTrang",
                     qtdnn.BAO_CAO_TEN                                AS      "baoCaoTen",
                     qtdnn.BAO_CAO_LY_DO_TRA_VE                       AS      "baoCaoLyDoTraVe",

                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by
                                          null).getclobval(), ' - ')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0) AS      "danhSachQuocGia",

                     today                                            AS      "today",
                     cb.HO                                            AS      "hoCanBo",
                     cb.TEN                                           AS      "tenCanBo",

                     dv.MA                                            AS      "maDonVi",
                     dv.TEN                                           AS      "tenDonVi",
                     DMDNN.MO_TA                                      AS      "tenMucDich",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS      "maChucVu",

                     td.MA                                            AS      "maHocVi",
                     td.TEN                                           AS      "tenHocVi",

                     cdnn.MA                                          AS      "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS      "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY cb.TEN, cb.HO, NGAY_DI DESC) R
              FROM QT_DI_NUOC_NGOAI qtdnn
                       LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND
                      (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                      AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
                      AND (timeType IS NULL OR (
                                  timeType = 1 AND
                                  (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                  (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                          ) OR (
                                       timeType = 2
                                   AND (qtdnn.NGAY_VE IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_VE >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_VE <= toYear)
                               ) OR (
                                       timeType = 3
                                   AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                               ) OR (
                                       timeType = 4
                                   AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND
                                        (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                                   AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                               ))
                      AND (tinhTrangCongTac IS NULL OR
                           (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR
                                                                                TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) <
                                                                                30)) OR
                           (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and
                            TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
                           (tinhTrangCongTac = 3 AND qtdnn.NGAY_VE >= today AND qtdnn.NGAY_DI <= today) OR
                           (tinhTrangCongTac = 4 AND qtdnn.NGAY_DI > today))
                      AND (tinhTrangBaoCao IS NULL OR tinhTrangBaoCao = qtdnn.BAO_CAO_TINH_TRANG)
                         ))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                  OR LOWER(qtdnn.NOI_DUNG_TIEP_NHAN) LIKE sT
                  OR LOWER(DMDNN.MO_TA) LIKE sT)
              ORDER BY cb.TEN, cb.HO, NGAY_DI DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_GIAI_THUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtgt.ID                                    AS "id",
                     qtgt.SHCC                                  AS "shcc",

                     (SELECT COUNT(*)
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "soGiaiThuong",

                     (select rtrim(xmlagg(xmlelement(e, qtgt_temp.TEN_GIAI_THUONG || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "danhSachGiaiThuong",

                     (select rtrim(xmlagg(xmlelement(e, qtgt_temp.NAM_CAP || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_GIAI_THUONG qtgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND
                              (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                              AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                          OR LOWER(qtgt_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)) AS "danhSachNamCap",

                     cb.HO                                      AS "hoCanBo",
                     cb.TEN                                     AS "tenCanBo",

                     dv.MA                                      AS "maDonVi",
                     dv.TEN                                     AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS "maChucVu",

                     td.MA                                      AS "maHocVi",
                     td.TEN                                     AS "tenHocVi",

                     cdnn.MA                                    AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC)     R
              FROM (SELECT *
                    FROM QT_GIAI_THUONG
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtgt
                       LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtgt.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                           list_shcc IN STRING, list_dv IN STRING,
                                           fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_GIAI_THUONG qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
            AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtgt.NOI_DUNG) LIKE sT
        OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
        OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
        OR LOWER(qtgt.NOI_CAP) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtgt.ID                   AS              "id",
                     qtgt.TEN_GIAI_THUONG      AS              "tenGiaiThuong",
                     qtgt.NOI_DUNG             AS              "noiDung",
                     qtgt.NOI_CAP              AS              "noiCap",
                     qtgt.NAM_CAP              AS              "namCap",
                     qtgt.SHCC                 AS              "shcc",
                     qtgt.SO_QUYET_DINH        AS              "soQuyetDinh",

                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",

                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
              FROM QT_GIAI_THUONG qtgt
                       LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
                      AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtgt.NOI_DUNG) LIKE sT
                  OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
                  OR LOWER(qtgt.SO_QUYET_DINH) LIKE sT
                  OR LOWER(qtgt.NOI_CAP) LIKE sT)
              ORDER BY qtgt.NAM_CAP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                               list_shcc IN STRING, list_dv IN STRING,
                                               fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                               tinhTrang IN NUMBER, searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOC_TAP_CONG_TAC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC) GROUP BY SHCC)) htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT htct.ID                                     as "id",
                     htct.SHCC                                   as "shcc",

                     (SELECT COUNT(*)
                      FROM QT_HOC_TAP_CONG_TAC htct_temp
                               LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (htct_temp.SHCC = htct.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType = 0) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType = 0 OR (
                                          timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                                  ))
                              AND (tinhTrang IS NULL OR
                                   ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                   (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND
                                    htct_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(htct_temp.NOI_DUNG) LIKE ST)) AS "soNoiDung",

                     (select rtrim(xmlagg(xmlelement(e, htct_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_HOC_TAP_CONG_TAC htct_temp
                               LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (htct_temp.SHCC = htct.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType = 0) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType = 0 OR (
                                          timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                                  ))
                              AND (tinhTrang IS NULL OR
                                   ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                   (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND
                                    htct_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(htct_temp.NOI_DUNG) LIKE ST)) AS "danhSachNoiDung",

                     cb.TEN                                      as "tenCanBo",
                     cb.HO                                       as "hoCanBo",

                     dv.MA                                       AS "maDonVi",
                     dv.TEN                                      AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                   AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                   AS "maChucVu",

                     td.MA                                       AS "maHocVi",
                     td.TEN                                      AS "tenHocVi",

                     cdnn.MA                                     AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                    AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU ASC)  R
              FROM (SELECT *
                    FROM QT_HOC_TAP_CONG_TAC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) htct
                       LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY htct.BAT_DAU ASC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                tinhTrang IN NUMBER, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOC_TAP_CONG_TAC htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR htct.BAT_DAU <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
                 (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(htct.NOI_DUNG) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT htct.ID                   as                   "id",
                     htct.SHCC                 as                   "shcc",
                     htct.BAT_DAU              as                   "batDau",
                     htct.KET_THUC             as                   "ketThuc",
                     htct.NOI_DUNG             as                   "noiDung",
                     htct.BAT_DAU_TYPE         as                   "batDauType",
                     htct.KET_THUC_TYPE        as                   "ketThucType",

                     today                     as                   "today",
                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU DESC) R
              FROM QT_HOC_TAP_CONG_TAC htct
                       LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType = 0) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType = 0 OR (
                                  timeType = 1 AND
                                  (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR htct.BAT_DAU <= toYear)
                          ))
                      AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
                           (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND
                            tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(htct.NOI_DUNG) LIKE ST)
              ORDER BY htct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

DROP FUNCTION QT_HOP_DONG_DVTL_TN_GROUP_PAGE;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_HUONG_DAN_LUAN_VAN
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
            LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
            LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
            LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.SHCC           AS  "shcc",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",
                        (SELECT COUNT(*)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "soDeTai",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.HO_TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachHoTen",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.TEN_LUAN_VAN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachDeTai",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp.NAM_TOT_NGHIEP || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                          AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                            OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "danhSachNamTotNghiep",
                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                      (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC) R
                FROM (SELECT *
                        FROM QT_HUONG_DAN_LUAN_VAN
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
                        LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                        LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                        LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HUONG_DAN_LUAN_VAN hdlv
             LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
            AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
        OR LOWER(hdlv.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hdlv.ID                   AS                          "id",
                     hdlv.TEN_LUAN_VAN         AS                          "tenLuanVan",
                     hdlv.HO_TEN               AS                          "hoTen",
                     hdlv.SHCC                 as                          "shcc",
                     hdlv.NAM_TOT_NGHIEP       AS                          "namTotNghiep",
                     hdlv.BAC_DAO_TAO          AS                          "bacDaoTao",
                     hdlv.SAN_PHAM             AS                          "sanPham",
                     cb.HO                     AS                          "hoCanBo",
                     cb.TEN                    AS                          "tenCanBo",

                     dv.MA                     AS                          "maDonVi",
                     dv.TEN                    AS                          "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                          "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                          "maChucVu",
                     td.MA                     AS                          "maHocVi",
                     td.TEN                    AS                          "tenHocVi",

                     cdnn.MA                   AS                          "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                          "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC) R
              FROM QT_HUONG_DAN_LUAN_VAN hdlv
                       LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
                      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
                  OR LOWER(hdlv.SAN_PHAM) LIKE sT)
              ORDER BY hdlv.NAM_TOT_NGHIEP DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                   as                   "id",
                     kdct.SHCC                 as                   "shcc",
                     kdct.BAT_DAU              as                   "batDau",
                     kdct.BAT_DAU_TYPE         as                   "batDauType",
                     kdct.KET_THUC             as                   "ketThuc",
                     kdct.KET_THUC_TYPE        as                   "ketThucType",
                     kdct.SO_QUYET_DINH        AS                   "soQuyetDinh",
                     kdct.NGAY_QUYET_DINH      AS                   "ngayQuyetDinh",

                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     cb.PHAI                   AS                   "phai",
                     cb.NGAY_SINH              AS                   "ngaySinh",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     CD.MA                     AS                   "maChucDanh",
                     CD.TEN                    AS                   "tenChucDanh",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
              FROM QT_KEO_DAI_CONG_TAC kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL))
                  OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                      OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND
                                                         (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR kdct.KET_THUC <= toYear)
                               ))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
              ORDER BY kdct.BAT_DAU DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_KEO_DAI_CONG_TAC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC) GROUP BY SHCC)) kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                                          as "id",
                     kdct.SHCC                                        as "shcc",

                     (SELECT COUNT(*)
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_KEO_DAI_CONG_TAC kdct_temp
                               LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (kdct_temp.SHCC = kdct.SHCC)
                        AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL))
                          OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                                     from dual
                                                                     connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR
                               (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                        from dual
                                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                          timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND
                                                            (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND
                                          (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                               timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND
                                                                 (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND
                                               (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                       ))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)) AS "danhSachBatDauType",

                     cb.TEN                                           as "tenCanBo",
                     cb.HO                                            as "hoCanBo",
                     cb.PHAI                                          AS "phai",
                     cb.NGAY_SINH                                     AS "ngaySinh",

                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     CD.MA                                            AS "maChucDanh",
                     CD.TEN                                           AS "tenChucDanh",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC )     R
              FROM (SELECT *
                    FROM QT_KEO_DAI_CONG_TAC
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              ORDER BY kdct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                                searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(100);
    listDv    STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    timeType  NUMBER;
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KEO_DAI_CONG_TAC kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
        OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
            OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
            OR (listShcc IS NULL AND listDv IS NULL))
            AND (timeType IS NULL OR (
                        timeType = 0 AND
                        (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                ) OR (
                             timeType = 1 AND
                             (kdct.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                             (toYear IS NULL OR kdct.KET_THUC <= toYear)
                     ))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(kdct.SO_QUYET_DINH) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT kdct.ID                   as                   "id",
                     kdct.SHCC                 as                   "shcc",
                     kdct.BAT_DAU              as                   "batDau",
                     kdct.BAT_DAU_TYPE         as                   "batDauType",
                     kdct.KET_THUC             as                   "ketThuc",
                     kdct.KET_THUC_TYPE        as                   "ketThucType",
                     kdct.SO_QUYET_DINH        AS                   "soQuyetDinh",
                     kdct.NGAY_QUYET_DINH      AS                   "ngayQuyetDinh",

                     cb.TEN                    as                   "tenCanBo",
                     cb.HO                     as                   "hoCanBo",
                     cb.PHAI                   AS                   "phai",
                     cb.NGAY_SINH              AS                   "ngaySinh",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     CD.MA                     AS                   "maChucDanh",
                     CD.TEN                    AS                   "tenChucDanh",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
              FROM QT_KEO_DAI_CONG_TAC kdct
                       LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

              WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL))
                  OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                      OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                      OR (listShcc IS NULL AND listDv IS NULL))
                      AND (timeType IS NULL OR (
                                  timeType = 0 AND
                                  (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND
                                  (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                          ) OR (
                                       timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND
                                                         (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND
                                       (toYear IS NULL OR kdct.KET_THUC <= toYear)
                               ))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
              ORDER BY kdct.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_DOWNLOAD_EXCEL(filter IN STRING)
    RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    list_shcc          STRING(100);
    list_dv            STRING(100);
    fromYear           NUMBER;
    toYear             NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtkl.ID                   AS                         "id",
                     qtkl.LY_DO_HINH_THUC      AS                         "lyDoHinhThuc",
                     qtkl.DIEM_THI_DUA         AS                         "diemThiDua",
                     qtkl.NOI_DUNG             AS                         "noiDung",
                     qtkl.NGAY_RA_QUYET_DINH   AS                         "ngayRaQuyetDinh",
                     qtkl.SO_QUYET_DINH        AS                         "soQuyetDinh",

                     dmkl.TEN                  AS                         "tenKyLuat",
                     cb.SHCC                   AS                         "maCanBo",
                     cb.HO                     AS                         "hoCanBo",
                     cb.TEN                    AS                         "tenCanBo",

                     dv.MA                     AS                         "maDonVi",
                     dv.TEN                    AS                         "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                         "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                         "maChucVu",

                     td.MA                     AS                         "maHocVi",
                     td.TEN                    AS                         "tenHocVi",
                     cdnn.MA                   AS                         "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                         "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
              FROM QT_KY_LUAT qtkl
                       LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (fromYear IS NULL OR
                           (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                      AND
                      (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                AND (listHinhThucKyLuat iS NULL OR
                     qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                              from dual
                                              connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
              ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                      filter IN STRING, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor          SYS_REFCURSOR;
    sT                 STRING(500) := '%' || lower(searchTerm) || '%';
    list_shcc          STRING(100);
    list_dv            STRING(100);
    fromYear           NUMBER;
    toYear             NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_KY_LUAT
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC) GROUP BY SHCC)) qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtkl.ID                                               AS  "id",
                     qtkl.SHCC                                             AS  "shcc",

                     (SELECT COUNT(*)
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "soKyLuat",

                     (select rtrim(xmlagg(xmlelement(e, dmkl.TEN || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "danhSachKyLuat",

                     (select rtrim(xmlagg(xmlelement(e, qtkl_temp.NGAY_RA_QUYET_DINH || ' ', '??').extract('//text()')
                                          order by null).getclobval(), '??')
                      FROM QT_KY_LUAT qtkl_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                      WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                        qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                              AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND
                                                      qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                        AND (listHinhThucKyLuat iS NULL OR
                             qtkl_temp.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                          OR LOWER(dmkl.TEN) LIKE sT
                          OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)) AS  "danhSachNgayRaQd",
                     cb.SHCC                                               AS  "maCanBo",
                     cb.HO                                                 AS  "hoCanBo",
                     cb.TEN                                                AS  "tenCanBo",

                     dv.MA                                                 AS  "maDonVi",
                     dv.TEN                                                AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                             AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                             AS  "maChucVu",

                     td.MA                                                 AS  "maHocVi",
                     td.TEN                                                AS  "tenHocVi",
                     cdnn.MA                                               AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                              AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC) R
              FROM (SELECT *
                    FROM QT_KY_LUAT
                    WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC) GROUP BY SHCC)) qtkl
                       LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    listHinhThucKyLuat STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHinhThucKyLuat') INTO listHinhThucKyLuat FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KY_LUAT qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
      AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
      AND (listHinhThucKyLuat iS NULL OR qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) from dual connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(qtkl.NOI_DUNG) LIKE sT
       OR LOWER(dmkl.TEN) LIKE sT
       OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",
                        qtkl.SHCC   AS "shcc",
                        qtkl.LY_DO_HINH_THUC    AS "lyDoHinhThuc",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",
                        qtkl.NOI_DUNG   AS "noiDung",
                        qtkl.NGAY_RA_QUYET_DINH AS "ngayRaQuyetDinh",
                        qtkl.SO_QUYET_DINH AS "soQuyetDinh",

                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                         (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                  AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                  AND (listHinhThucKyLuat iS NULL OR qtkl.LY_DO_HINH_THUC IN (SELECT regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) from dual connect by regexp_substr(listHinhThucKyLuat, '[^,]+', 1, level) is not null))
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(qtkl.NOI_DUNG) LIKE sT
                   OR LOWER(dmkl.TEN) LIKE sT
                   OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                 ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                             searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_LAM_VIEC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtlvn.ID                                         AS "id",
                     qtlvn.SHCC                                       AS "shcc",

                     cb.HO                                            AS "hoCanBo",
                     cb.TEN                                           AS "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND
                                    (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND
                                   (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                                  ))
                                 AND (tinhTrang IS NULL OR
                                      ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                      (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND
                                       qtlvn_temp.KET_THUC < today AND tinhTrang = 1)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)) AS "soQuaTrinh",

                     (select rtrim(xmlagg(xmlelement(e, qtlvn_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND
                                    (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND
                                   (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                                  ))
                                 AND (tinhTrang IS NULL OR
                                      ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                      (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND
                                       qtlvn_temp.KET_THUC < today AND tinhTrang = 1)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                          OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)) AS "danhSachNoiDung",
                     dv.MA                                            AS "maDonVi",
                     dv.TEN                                           AS "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",

                     td.MA                                            AS "maHocVi",
                     td.TEN                                           AS "tenHocVi",

                     cdnn.MA                                          AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                         AS "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC)           R
              FROM (SELECT *
                    FROM QT_LAM_VIEC_NGOAI
                    WHERE ID IN (SELECT MAX(ID)
                                 FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC)
                                 GROUP BY SHCC)) qtlvn
                       LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtlvn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                              list_shcc IN STRING, list_dv IN STRING,
                                              fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                              searchTerm IN STRING,
                                              totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LAM_VIEC_NGOAI qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                 (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                ))
               AND (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtlvn.NOI_DUNG) LIKE sT
        OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtlvn.ID                  AS              "id",
                     qtlvn.NOI_DUNG            AS              "noiDung",
                     qtlvn.NOI_LAM_VIEC        AS              "noiLamViec",
                     qtlvn.BAT_DAU             AS              "batDau",
                     qtlvn.BAT_DAU_TYPE        AS              "batDauType",
                     qtlvn.KET_THUC            AS              "ketThuc",
                     qtlvn.KET_THUC_TYPE       AS              "ketThucType",
                     qtlvn.SHCC                AS              "shcc",

                     today                     AS              "today",
                     cb.HO                     AS              "hoCanBo",
                     cb.TEN                    AS              "tenCanBo",

                     dv.MA                     AS              "maDonVi",
                     dv.TEN                    AS              "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS              "maChucVu",
                     td.MA                     AS              "maHocVi",
                     td.TEN                    AS              "tenHocVi",

                     cdnn.MA                   AS              "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS              "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
              FROM QT_LAM_VIEC_NGOAI qtlvn
                       LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND ((qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                           (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                          ))
                         AND
                     (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                      (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND
                       tinhTrang = 1)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtlvn.NOI_DUNG) LIKE sT
                  OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT)
              ORDER BY qtlvn.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  searchTerm IN STRING,
                                                  maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                  maDonVi IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHIEN_CUU_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnckh.SHCC                                                    AS "shcc",
                     cb.HO                                                          AS "hoCanBo",
                     cb.TEN                                                         AS "tenCanBo",
                     (select TEN FROM DM_TRINH_DO WHERE cb.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",
                     (SELECT COUNT(*)
                      FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                               LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                      WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                        AND ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                          OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                          OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                          OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                        AND (timeType = 0 OR (timeType = 1 AND
                                              (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                               (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                          AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                          OR ((timeType = 2) AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.KET_THUC >= fromYear))
                              AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.KET_THUC <= toYear)))
                          OR ((timeType = 3) AND
                              (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear))
                              AND (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                   (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU <= toYear)))
                          )
                        AND (searchTerm = ''
                          OR LOWER(CB.SHCC) LIKE sT
                          OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT))    AS "soDeTai",

                     (select rtrim(xmlagg(xmlelement(e, qtnckh_tmp.TEN_DE_TAI ||
                                                        CASE
                                                            WHEN (qtnckh_tmp.BAT_DAU IS NOT NULL)
                                                                THEN ' (' || to_char(
                                                                            qtnckh_tmp.BAT_DAU / (1000 * 60 * 60 * 24) +
                                                                            + TO_DATE('1970-01-01 08:00:00', 'YYYY-MM-DD HH:MI:SS'),
                                                                            qtnckh_tmp.BAT_DAU_TYPE) || ') '
                                                            ELSE ' ' END, '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                               LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                      WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                        AND ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                          OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                                       from dual
                                                                       connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                          OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                          OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                        AND (timeType = 0 OR (timeType = 1 AND
                                              (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                               (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                          AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                          OR ((timeType = 2) AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.KET_THUC >= fromYear))
                              AND
                              (qtnckh_tmp.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.KET_THUC <= toYear)))
                          OR ((timeType = 3) AND
                              (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                               (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear))
                              AND (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                   (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU <= toYear)))
                          )
                        AND (searchTerm = ''
                          OR LOWER(CB.SHCC) LIKE sT
                          OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                          OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT))    AS "danhSachDeTai",
                     dv.MA                                                          AS "maDonVi",
                     dv.TEN                                                         AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                      AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                      AS "maChucVu",
                     td.MA                                                          AS "maHocVi",
                     td.TEN                                                         AS "tenHocVi",

                     cdnn.MA                                                        AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                                       AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnckh.BAT_DAU DESC)                  R
              FROM (SELECT *
                    FROM QT_NGHIEN_CUU_KHOA_HOC
                    WHERE ID IN
                          (SELECT MAX(ID)
                           FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC)
                           GROUP BY SHCC)) qtnckh
                       LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                       LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnckh.BAT_DAU DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   searchTerm IN STRING,
                                                   maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   maDonVi IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
        OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
        OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
        OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
      AND (timeType = 0 OR (timeType = 1 AND
                            (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
        AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
        OR ((timeType = 2) AND
            (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
            AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
        OR ((timeType = 3) AND
            (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
            AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear)))
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnckh.ID                   AS                   "id",
                     qtnckh.TEN_DE_TAI           AS                   "tenDeTai",
                     qtnckh.MA_SO_CAP_QUAN_LY    AS                   "maSoCapQuanLy",
                     qtnckh.KINH_PHI             AS                   "kinhPhi",
                     qtnckh.BAT_DAU              AS                   "batDau",
                     qtnckh.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnckh.KET_THUC             AS                   "ketThuc",
                     qtnckh.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnckh.NGAY_NGHIEM_THU      AS                   "ngayNghiemThu",
                     qtnckh.NGAY_NGHIEM_THU_TYPE AS                   "ngayNghiemThuType",
                     qtnckh.VAI_TRO              AS                   "vaiTro",
                     qtnckh.KET_QUA              AS                   "ketQua",
                     qtnckh.THOI_GIAN            AS                   "thoiGian",
                     qtnckh.SHCC                 AS                   "shcc",
                     qtnckh.MA_SO                AS                   "maSo",
                     qtnckh.CAP_QUAN_LY          AS                   "capQuanLy",
                     CB.HO                       AS                   "hoCanBo",
                     CB.TEN                      AS                   "tenCanBo",
                     qtnckh.IN_LLKH              AS                   "inLLKH",

                     dv.MA                       AS                   "maDonVi",
                     dv.TEN                      AS                   "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)   AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)   AS                   "maChucVu",

                     td.MA                       AS                   "maHocVi",
                     td.TEN                      AS                   "tenHocVi",

                     cdnn.MA                     AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                    AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnckh.BAT_DAU DESC) R
              FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                       LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                  OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                  OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                  OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                AND (timeType = 0 OR (timeType = 1 AND
                                      (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
                  AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
                  OR ((timeType = 2) AND
                      (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
                      AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
                  OR ((timeType = 3) AND
                      (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
                      AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear)))
                  )
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE sT
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                  OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                  OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                  OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
                  OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
              ORDER BY qtnckh.BAT_DAU DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                   AS                   "id",
                     qtnp.SHCC                 AS                   "shcc",
                     qtnp.LY_DO                AS                   "lyDo",
                     qtnp.LY_DO_KHAC           AS                   "lyDoKhac",
                     qtnp.NOI_DEN              AS                   "noiDen",
                     qtnp.GHI_CHU              AS                   "ghiChu",
                     qtnp.BAT_DAU              AS                   "batDau",
                     qtnp.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnp.KET_THUC             AS                   "ketThuc",
                     qtnp.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnp.NGAY_DI_DUONG        AS                   "ngayDiDuong",

                     today                     AS                   "today",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",
                     cb.NGAY_BAT_DAU_CONG_TAC  AS                   "ngayBatDauCongTac",

                     dmnp.MA                   AS                   "maNghiPhep",
                     dmnp.TEN                  AS                   "tenNghiPhep",
                     dmnp.SO_NGAY_PHEP         AS                   "ngayNghiPhep",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM QT_NGHI_PHEP qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL) AND (lyDo IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (tinhTrang IS NULL OR
                           (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
              ORDER BY qtnp.BAT_DAU);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        filter IN STRING, searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_PHEP
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                                    AS  "id",
                     qtnp.SHCC                                  AS  "shcc",

                     cb.HO                                      AS  "hoCanBo",
                     cb.TEN                                     AS  "tenCanBo",

                     (SELECT COUNT(*)
                      FROM QT_NGHI_PHEP qtnp_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnp_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                               LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp_temp.LY_DO = dmnp.MA)
                      WHERE (qtnp_temp.SHCC = qtnp.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL) AND (lyDo IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (tinhTrang IS NULL OR
                                   (qtnp_temp.BAT_DAU <= today and qtnp_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.KET_THUC < today AND tinhTrang = 1) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.BAT_DAU > today AND tinhTrang = 3))
                              AND
                              (qtnp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp_temp.BAT_DAU >= fromYear))
                              AND (qtnp_temp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp_temp.BAT_DAU <= toYear))))
                        AND (lyDo IS NULL OR (qtnp_temp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtnp_temp.LY_DO_KHAC) LIKE sT
                          OR LOWER(qtnp_temp.NOI_DEN) LIKE sT
                          OR LOWER(dmnp.TEN) LIKE sT
                          OR LOWER(qtnp_temp.GHI_CHU) LIKE sT)) AS  "soLanNghi",

                     (select rtrim(xmlagg(
                                           xmlelement(e, dmnp.TEN || ':' || qtnp_temp.LY_DO_KHAC, '??').extract('//text()')
                                           order by null).getclobval(), '??')
                      FROM QT_NGHI_PHEP qtnp_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnp_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                               LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp_temp.LY_DO = dmnp.MA)
                      WHERE (qtnp_temp.SHCC = qtnp.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (tinhTrang IS NULL) AND (lyDo IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (tinhTrang IS NULL OR
                                   (qtnp_temp.BAT_DAU <= today and qtnp_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.KET_THUC < today AND tinhTrang = 1) OR
                                   (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.BAT_DAU > today AND tinhTrang = 3))
                              AND
                              (qtnp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp_temp.BAT_DAU >= fromYear))
                              AND (qtnp_temp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp_temp.BAT_DAU <= toYear))))
                        AND (lyDo IS NULL OR (qtnp_temp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(qtnp_temp.LY_DO_KHAC) LIKE sT
                          OR LOWER(qtnp_temp.NOI_DEN) LIKE sT
                          OR LOWER(dmnp.TEN) LIKE sT
                          OR LOWER(qtnp_temp.GHI_CHU) LIKE sT)) AS  "danhSachLyDoNghi",

                     dv.MA                                      AS  "maDonVi",
                     dv.TEN                                     AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "maChucVu",
                     td.MA                                      AS  "maHocVi",
                     td.TEN                                     AS  "tenHocVi",

                     cdnn.MA                                    AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_NGHI_PHEP
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnp.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                         filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv   STRING(100);
    fromYear  NUMBER;
    toYear    NUMBER;
    tinhTrang NUMBER;
    lyDo      STRING(100);
BEGIN
    /* Init filter */-------------------------------------------------------------------------------------
    SELECT JSON_VALUE(filter, '$.listDv') INTO list_dv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listShcc') INTO list_shcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.tinhTrang') INTO tinhTrang FROM DUAL;
    SELECT JSON_VALUE(filter, '$.lyDo') INTO lyDo FROM DUAL;

    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_PHEP qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (tinhTrang IS NULL) AND (lyDo IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (tinhTrang IS NULL OR
                 (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                 (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
            AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
            AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
      AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                           from dual
                                           connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
        OR LOWER(qtnp.NOI_DEN) LIKE sT
        OR LOWER(dmnp.TEN) LIKE sT
        OR LOWER(qtnp.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnp.ID                   AS                   "id",
                     qtnp.SHCC                 AS                   "shcc",
                     qtnp.LY_DO                AS                   "lyDo",
                     qtnp.LY_DO_KHAC           AS                   "lyDoKhac",
                     qtnp.NOI_DEN              AS                   "noiDen",
                     qtnp.GHI_CHU              AS                   "ghiChu",
                     qtnp.BAT_DAU              AS                   "batDau",
                     qtnp.BAT_DAU_TYPE         AS                   "batDauType",
                     qtnp.KET_THUC             AS                   "ketThuc",
                     qtnp.KET_THUC_TYPE        AS                   "ketThucType",
                     qtnp.NGAY_DI_DUONG        AS                   "ngayDiDuong",

                     today                     AS                   "today",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",
                     cb.NGAY_BAT_DAU_CONG_TAC  AS                   "ngayBatDauCongTac",

                     dmnp.MA                   AS                   "maNghiPhep",
                     dmnp.TEN                  AS                   "tenNghiPhep",
                     dmnp.SO_NGAY_PHEP         AS                   "ngayNghiPhep",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",

                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
              FROM QT_NGHI_PHEP qtnp
                       LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                       LEFT JOIN DM_NGHI_PHEP dmnp ON (qtnp.LY_DO = dmnp.MA)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (tinhTrang IS NULL) AND (lyDo IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (tinhTrang IS NULL OR
                           (qtnp.BAT_DAU <= today and qtnp.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC < today AND tinhTrang = 1) OR
                           (qtnp.KET_THUC IS NOT NULL AND qtnp.BAT_DAU > today AND tinhTrang = 3))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnp.BAT_DAU >= fromYear))
                      AND (qtnp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnp.BAT_DAU <= toYear))))
                AND (lyDo IS NULL OR (qtnp.LY_DO IN (SELECT regexp_substr(lyDo, '[^,]+', 1, level)
                                                     from dual
                                                     connect by regexp_substr(lyDo, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(qtnp.LY_DO_KHAC) LIKE sT
                  OR LOWER(qtnp.NOI_DEN) LIKE sT
                  OR LOWER(dmnp.TEN) LIKE sT
                  OR LOWER(qtnp.GHI_CHU) LIKE sT)
              ORDER BY qtnp.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                                fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.ID                  AS                    "id",
                     qtnts.SHCC                AS                    "shcc",
                     qtnts.NOI_DUNG            AS                    "noiDung",
                     qtnts.BAT_DAU             AS                    "batDau",
                     qtnts.BAT_DAU_TYPE        AS                    "batDauType",
                     qtnts.KET_THUC            AS                    "ketThuc",
                     qtnts.KET_THUC_TYPE       AS                    "ketThucType",
                     qtnts.TRO_LAI_CONG_TAC    AS                    "troLaiCongTac",

                     today                     AS                    "today",

                     cb.SHCC                   AS                    "maCanBo",
                     cb.HO                     AS                    "hoCanBo",
                     cb.TEN                    AS                    "tenCanBo",

                     dv.MA                     AS                    "maDonVi",
                     dv.TEN                    AS                    "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "maChucVu",

                     td.MA                     AS                    "maHocVi",
                     td.TEN                    AS                    "tenHocVi",

                     cdnn.MA                   AS                    "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                    "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM QT_NGHI_THAI_SAN qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType IS NULL
                          OR (timeType = 0 AND
                              (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                              (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                          OR (timeType = 1 AND
                              (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                              (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                      AND (tinhTrang IS NULL OR
                           (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnts.KET_THUC < today AND tinhTrang = 1))))
              ORDER BY qtnts.BAT_DAU DESC);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            list_shcc IN STRING, list_dv IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                            tinhTrang IN NUMBER, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_THAI_SAN
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.SHCC                                   AS "shcc",

                     (SELECT COUNT(*)
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "soLanNghi",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.NOI_DUNG || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachNoiDung",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachBatDau",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachKetThuc",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachKetThucType",

                     (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU_TYPE || ' ', '??').extract('//text()') order
                                          by null).getclobval(), '??')
                      FROM QT_NGHI_THAI_SAN qtnts_temp
                               LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                               LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                               LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                               LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                      WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                              (timeType IS NULL) AND (tinhTrang IS NULL))
                          OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                                      from dual
                                                                      connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                              OR (list_dv IS NOT NULL AND
                                  cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (timeType IS NULL
                                  OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                  OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND
                                                        (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND
                                      (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                              AND (tinhTrang IS NULL OR
                                   (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                                   (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                   (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE ST
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                          OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)) AS "danhSachBatDauType",

                     today                                        AS "today",

                     cb.SHCC                                      AS "maCanBo",
                     cb.HO                                        AS "hoCanBo",
                     cb.TEN                                       AS "tenCanBo",

                     dv.MA                                        AS "maDonVi",
                     dv.TEN                                       AS "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                    AS "maChucVu",
                     td.MA                                        AS "maHocVi",
                     td.TEN                                       AS "tenHocVi",

                     cdnn.MA                                      AS "maChucDanhNgheNghiep",
                     cdnn.TEN                                     AS "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM (SELECT *
                    FROM QT_NGHI_THAI_SAN
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY qtnts.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                             list_shcc IN STRING, list_dv IN STRING,
                                             fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                             tinhTrang IN NUMBER, searchTerm IN STRING,
                                             totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_THAI_SAN qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (timeType IS NULL) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (timeType IS NULL
                OR (timeType = 0 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                    (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                OR
                 (timeType = 1 AND (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                  (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
            AND (tinhTrang IS NULL OR
                 (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                 (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                 (qtnts.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(qtnts.NOI_DUNG) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnts.ID                  AS                    "id",
                     qtnts.SHCC                AS                    "shcc",
                     qtnts.NOI_DUNG            AS                    "noiDung",
                     qtnts.BAT_DAU             AS                    "batDau",
                     qtnts.BAT_DAU_TYPE        AS                    "batDauType",
                     qtnts.KET_THUC            AS                    "ketThuc",
                     qtnts.KET_THUC_TYPE       AS                    "ketThucType",
                     qtnts.TRO_LAI_CONG_TAC    AS                    "troLaiCongTac",

                     today                     AS                    "today",

                     cb.SHCC                   AS                    "maCanBo",
                     cb.HO                     AS                    "hoCanBo",
                     cb.TEN                    AS                    "tenCanBo",

                     dv.MA                     AS                    "maDonVi",
                     dv.TEN                    AS                    "tenDonVi",

                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                    "maChucVu",
                     td.MA                     AS                    "maHocVi",
                     td.TEN                    AS                    "tenHocVi",

                     cdnn.MA                   AS                    "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                    "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
              FROM QT_NGHI_THAI_SAN qtnts
                       LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                      (timeType IS NULL) AND (tinhTrang IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType IS NULL
                          OR (timeType = 0 AND
                              (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND
                              (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                          OR (timeType = 1 AND
                              (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND
                              (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                      AND (tinhTrang IS NULL OR
                           (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                           (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                           (qtnts.KET_THUC < today AND tinhTrang = 1))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(qtnts.NOI_DUNG) LIKE ST)
              ORDER BY qtnts.BAT_DAU DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    listShcc  STRING(200);
    listDonVi STRING(100);
    fromYear  NUMBER(20);
    toYear    NUMBER(20);
    listLyDo  STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLyDo') INTO listLyDo FROM DUAL;
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnv.MA                   AS                     "ma",
                     qtnv.HO_TEN               AS                     "hoTen",
                     qtnv.SHCC                 AS                     "shcc",
                     qtnv.NGAY_NGHI            AS                     "ngayNghi",
                     qtnv.SO_QUYET_DINH        AS                     "soQuyetDinh",
                     qtnv.NOI_DUNG             AS                     "noiDung",
                     qtnv.GHI_CHU              AS                     "ghiChu",
                     qtnv.DIEN_NGHI            AS                     "dienNghi",

                     cb.HO                     AS                     "hoCanBo",
                     cb.TEN                    AS                     "tenCanBo",

                     dv.MA                     AS                     "maDonVi",
                     dv.TEN                    AS                     "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                     "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                     "maChucVu",
                     td.MA                     AS                     "maHocVi",
                     td.TEN                    AS                     "tenHocVi",

                     nv.TEN                    as                     "tenLyDo",
                     qtnv.LY_DO_NGHI           AS                     "lyDoNghi",
                     cdnn.MA                   AS                     "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                     "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
              FROM QT_NGHI_VIEC qtnv
                       LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                       LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
                AND (listLyDo IS NULL OR
                     (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDonVi IS NULL OR
                     (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))

              ORDER BY qtnv.NGAY_NGHI DESC NULLS LAST, qtnv.SO_QUYET_DINH NULLS LAST, qtnv.SHCC NULLS LAST,
                       cb.HO NULLS LAST);
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                         filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc  STRING(200);
    listDonVi STRING(100);
    fromYear  NUMBER(20);
    toYear    NUMBER(20);
    listLyDo  STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLyDo') INTO listLyDo FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_VIEC qtnv
             LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
             LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((fromYear IS NULL OR fromYear = 0 OR (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
           (toYear IS NULL OR toYear = 0 OR (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
      AND (listLyDo IS NULL OR
           (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
      AND (listShcc IS NULL OR
           (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
      AND (listDonVi IS NULL OR
           (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(qtnv.HO_TEN) LIKE sT
        OR LOWER(qtnv.NOI_DUNG) LIKE sT
        OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT qtnv.MA            AS                            "ma",
                     qtnv.HO_TEN        AS                            "hoTen",
                     qtnv.SHCC          AS                            "shcc",
                     qtnv.NGAY_NGHI     AS                            "ngayNghi",
                     qtnv.SO_QUYET_DINH AS                            "soQuyetDinh",
                     qtnv.NOI_DUNG      AS                            "noiDung",
                     qtnv.GHI_CHU       AS                            "ghiChu",
                     qtnv.DIEN_NGHI     AS                            "dienNghi",

                     cb.HO              AS                            "hoCanBo",
                     cb.TEN             AS                            "tenCanBo",

                     dv.MA              AS                            "maDonVi",
                     dv.TEN             AS                            "tenDonVi",
                      (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                        AS "maChucVu",
                     td.MA              AS                            "maHocVi",
                     td.TEN             AS                            "tenHocVi",

                     nv.TEN             as                            "tenLyDo",
                     qtnv.LY_DO_NGHI    AS                            "lyDoNghi",
                     cdnn.MA            AS                            "maChucDanhNgheNghiep",
                     cdnn.TEN           AS                            "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
              FROM QT_NGHI_VIEC qtnv
                       LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                       LEFT JOIN DM_NGHI_VIEC nv on nv.MA = qtnv.LY_DO_NGHI
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE ((fromYear IS NULL OR fromYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI >= fromYear)) AND
                     (toYear IS NULL OR toYear = 0 OR
                      (qtnv.NGAY_NGHI IS NOT NULL AND qtnv.NGAY_NGHI <= toYear + 86399999)))
                AND (listLyDo IS NULL OR
                     (listLyDo IS NOT NULL AND qtnv.LY_DO_NGHI IN (SELECT regexp_substr(listLyDo, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listLyDo, '[^,]+', 1, level) is not null)))
                AND (listShcc IS NULL OR
                     (listShcc IS NOT NULL AND qtnv.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null)))
                AND (listDonVi IS NULL OR
                     (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null)))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE ST
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                  OR LOWER(qtnv.HO_TEN) LIKE sT
                  OR LOWER(qtnv.NOI_DUNG) LIKE sT
                  OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT)
              ORDER BY qtnv.NGAY_NGHI DESC NULLS LAST , qtnv.SO_QUYET_DINH NULLS LAST, qtnv.SHCC NULLS LAST, cb.HO NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                           list_shcc IN STRING, list_dv IN STRING,
                                           fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM SACH_GIAO_TRINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT sgt.ID                                     AS  "id",
                     sgt.SHCC                                   AS  "shcc",
                     (SELECT COUNT(*)
                      FROM SACH_GIAO_TRINH sgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (sgt_temp.SHCC = sgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(sgt_temp.TEN) LIKE sT
                          OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                          OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                          OR LOWER(sgt_temp.BUT_DANH) LIKE sT)) AS  "soLuong",

                     (select rtrim(xmlagg(xmlelement(e, sgt_temp.TEN || ' ', '??').extract('//text()') order by
                                          null).getclobval(), '??')
                      FROM SACH_GIAO_TRINH sgt_temp
                               LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                               LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                      WHERE (sgt_temp.SHCC = sgt.SHCC)
                        AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                          OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                              AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND
                                   (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                        AND (searchTerm = ''
                          OR LOWER(cb.SHCC) LIKE sT
                          OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                          OR LOWER(sgt_temp.TEN) LIKE sT
                          OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                          OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                          OR LOWER(sgt_temp.BUT_DANH) LIKE sT)) AS  "danhSach",

                     cb.HO                                      AS  "hoCanBo",
                     cb.TEN                                     AS  "tenCanBo",
                     dv.MA                                      AS  "maDonVi",
                     dv.TEN                                     AS  "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                  AS  "maChucVu",

                     td.MA                                      AS  "maHocVi",
                     td.TEN                                     AS  "tenHocVi",

                     cdnn.MA                                    AS  "maChucDanhNgheNghiep",
                     cdnn.TEN                                   AS  "tenChucDanhNgheNghiep",
                     ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
              FROM (SELECT *
                    FROM SACH_GIAO_TRINH
                    WHERE ID IN
                          (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
                       LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              ORDER BY sgt.NAM_SAN_XUAT DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                            list_shcc IN STRING, list_dv IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                            totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM SACH_GIAO_TRINH sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
            OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(sgt.TEN) LIKE sT
        OR LOWER(sgt.THE_LOAI) LIKE sT
        OR LOWER(sgt.SAN_PHAM) LIKE sT
        OR LOWER(sgt.CHU_BIEN) LIKE sT
        OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
        OR LOWER(sgt.BUT_DANH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT sgt.ID                    AS                   "id",
                     sgt.TEN                   AS                   "ten",
                     sgt.THE_LOAI              AS                   "theLoai",
                     sgt.NHA_SAN_XUAT          AS                   "nhaSanXuat",
                     sgt.NAM_SAN_XUAT          AS                   "namSanXuat",
                     sgt.SAN_PHAM              AS                   "sanPham",
                     sgt.CHU_BIEN              AS                   "chuBien",
                     sgt.BUT_DANH              AS                   "butDanh",
                     sgt.QUOC_TE               AS                   "quocTe",
                     sgt.SHCC                  AS                   "shcc",

                     cb.HO                     AS                   "hoCanBo",
                     cb.TEN                    AS                   "tenCanBo",

                     dv.MA                     AS                   "maDonVi",
                     dv.TEN                    AS                   "tenDonVi",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "tenChucVu",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1) AS                   "maChucVu",
                     td.MA                     AS                   "maHocVi",
                     td.TEN                    AS                   "tenHocVi",

                     cdnn.MA                   AS                   "maChucDanhNgheNghiep",
                     cdnn.TEN                  AS                   "tenChucDanhNgheNghiep",

                     ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
              FROM SACH_GIAO_TRINH sgt
                       LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                       LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                       LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                       LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level)
                                                              from dual
                                                              connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
                      AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
                AND (searchTerm = ''
                  OR LOWER(cb.SHCC) LIKE sT
                  OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                  OR LOWER(sgt.TEN) LIKE sT
                  OR LOWER(sgt.THE_LOAI) LIKE sT
                  OR LOWER(sgt.SAN_PHAM) LIKE sT
                  OR LOWER(sgt.CHU_BIEN) LIKE sT
                  OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
                  OR LOWER(sgt.BUT_DANH) LIKE sT)
              ORDER BY sgt.NAM_SAN_XUAT DESC)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
          (NAM_HOC = namHoc AND HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
              WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
                    (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

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

