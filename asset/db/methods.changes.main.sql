CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_ALL_PHAN_HOI(
    idNhiemVu IN NUMBER
)   RETURN SYS_REFCURSOR AS
my_cursor SYS_REFCURSOR;
BEGIN

OPEN my_cursor FOR
SELECT
    ph.ID               as  "id",
    ph.NOI_DUNG         as  "noiDung",
    ph.CAN_BO_GUI       as  "canBoGui",
    ph.NGAY_TAO         as  "ngayTao",
    cb.HO               as  "ho",
    cb.TEN              as  "ten",
    CASE
        WHEN cb.HO IS NULL THEN cb.TEN
        WHEN cb.TEN IS NULL THEN cb.HO
    END as "hoTenDayDu"

FROM HCTH_PHAN_HOI ph
    LEFT JOIN TCHC_CAN_BO cb on ph.CAN_BO_GUI = cb.SHCC

WHERE (idNhiemVu is not null and ph.KEY = idNhiemVu)
ORDER BY NGAY_TAO;
RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_NHIEM_VU_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor  SYS_REFCURSOR;
    sT         STRING(500) := '%' || lower(searchTerm) || '%';
    donViNhan  Number;
    canBoNhan  String(128);
    shccCanBo  String(24);
    donViCanBo String(128);
    canBoType  String(24);

BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViNhan') INTO donViNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoNhan') INTO canBoNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoType') INTO canBoType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_NHIEM_VU nv
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
    WHERE
-- check if user is related to mission
(
    -- RECTOR or HCTH staff can see all mission
            canBoType = 'HCTH' or canBoType = 'RECTOR' OR
        -- other staff mission permission check
            nv.NGUOI_TAO = shccCanBo or EXISTS(select cbn.id
                                               from HCTH_CAN_BO_NHAN cbn
                                               where cbn.LOAI = 'NHIEM_VU'
                                                 and cbn.MA = nv.ID
                                                 and cbn.CAN_BO_NHAN = shccCanBo)
        or (donViCanBo is not null and Exists(
            select dvn.id
            from HCTH_DON_VI_NHAN dvn
            where dvn.MA = nv.id
              and dvn.LOAI = 'NHIEM_VU'
              and dvn.DON_VI_NHAN in
                  (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                   from dual
                   connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
        ))
    )
    --     ((
--         userShcc is not null AND nv.NGUOI_TAO = userShcc
--     ) OR
--     (
--         hcthcbn.CAN_BO_NHAN IS NOT NULL AND
--         INSTR(hcthcbn.CAN_BO_NHAN, userShcc) != 0
--      ) OR
--      (
--         userShcc is null
--     ))
--     AND
--     ((
--         donViNhan IS NULL
--         AND canBoNhan IS NULL
--     )
--     OR (
--         canBoNhan is NOT NULL
--         AND INSTR(hcthcbn.CAN_BO_NHAN, canBoNhan) != 0
--     )
--     OR (
--         donViNhan IS NOT NULL
--         AND nv.DON_VI_NHAN is not NULL
--         AND (
--             (
--                 select count(id2)
--                 from (
--                         select *
--                         from (
--                                 (
--                                     SELECT to_number(COLUMN_VALUE) as id1
--                                     FROM xmltable(donViNhan)
--                                     ORDER BY id1
--                                 ) t1
--                                 LEFT JOIN (
--                                     SELECT to_number(COLUMN_VALUE) as id2
--                                     FROM xmltable(nv.DON_VI_NHAN)
--                                     ORDER BY id2
--                                 ) t2 ON id1 = id2
--                             )
--                     )
--             ) != 0
--         )
--     ))
--     AND (
--         sT = ''
--         OR LOWER(nv.NOI_DUNG) LIKE sT
--     )
    ;
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
        FROM (SELECT nv.ID                                                AS "id",
                     nv.TIEU_DE                                           AS "tieuDe",
                     nv.NOI_DUNG                                          AS "noiDung",
                     nv.NGAY_BAT_DAU                                      AS "ngayBatDau",
                     nv.NGAY_KET_THUC                                     AS "ngayKetThuc",
                     nv.NGAY_TAO                                          AS "ngayTao",
                     nv.DO_UU_TIEN                                        AS "doUuTien",
                     nv.DON_VI_NHAN                                       AS "maDonViNhan",
                     nv.NGUOI_TAO                                         AS "nguoiTao",
                     nv.LIEN_PHONG                                        AS "lienPhong",
                     nv.TRANG_THAI                                        AS "trangThai",


                     (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                         order by dvn.TEN
                         )
                      FROM DM_DON_VI dvn
                               LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                      WHERE hcthdvn.MA = nv.ID
                        AND hcthdvn.LOAI = 'NHIEM_VU'
                     )                                                    AS "danhSachDonViNhan",


                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cbn.HO IS NULL THEN cbn.TEN
                                         WHEN cbn.TEN IS NULL THEN cbn.HO
                                         ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                         END,
                                     '; '
                                 ) WITHIN GROUP (
                                         order by cbn.TEN
                                         ) as "hoVaTenCanBo"
                      FROM TCHC_CAN_BO cbn
                               LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                      WHERE Exists(select hcthcbn.id
                                   from HCTH_CAN_BO_NHAN hcthcbn
                                   where hcthcbn.LOAI = 'NHIEM_VU'
                                     and hcthcbn.MA = nv.id
                                     and hcthcbn.CAN_BO_NHAN = cbn.SHCC)) as "danhSachCanBoNhan",


                     CASE
                         when nv.NGUOI_TAO is not null then
                             (SELECT (
                                         CASE
                                             WHEN cbn.HO IS NULL THEN cbn.TEN
                                             WHEN cbn.TEN IS NULL THEN cbn.HO
                                             ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                             END
                                         )
                              FROM TCHC_CAN_BO cbn
                              WHERE nv.NGUOI_TAO = cbn.shcc) END          AS "tenNguoiTao",

                     ROW_NUMBER() OVER (
                         ORDER BY nv.ID DESC
                         )                                                   R
              FROM HCTH_NHIEM_VU nv
              WHERE (
                        -- RECTOR or HCTH staff can see all mission
                                canBoType = 'HCTH'
                            or canBoType = 'RECTOR'
                            OR
                            -- other staff mission permission check
                                nv.NGUOI_TAO = shccCanBo
                            or EXISTS(select cbn.id
                                      from HCTH_CAN_BO_NHAN cbn
                                      where cbn.LOAI = 'NHIEM_VU'
                                        and cbn.MA = nv.ID
                                        and cbn.CAN_BO_NHAN = shccCanBo)
                            or (donViCanBo is not null
                            and Exists(
                                        select dvn.id
                                        from HCTH_DON_VI_NHAN dvn
                                        where dvn.MA = nv.id
                                          and dvn.LOAI = 'NHIEM_VU'
                                          and dvn.DON_VI_NHAN in
                                              (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                               from dual
                                               connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                                    ))
                        ))
--         ((
--             userShcc is not null and
--             nv.NGUOI_TAO = userShcc
--         ) OR
--         (
--             hcthcbn.CAN_BO_NHAN IS NOT NULL AND
--             INSTR(hcthcbn.CAN_BO_NHAN, userShcc) != 0
--         ) OR
--         (
--              userShcc is null
--         ))
--         AND
--         (
--             (
--                 canBoNhan IS NULL
--                 AND donViNhan IS NULL
--             )
--             OR (
--                 canBoNhan is NOT NULL
--                 AND INSTR(hcthcbn.CAN_BO_NHAN, canBoNhan) != 0
--             )
--             OR (
--                 donViNhan IS NOT NULL
--                 AND nv.DON_VI_NHAN is not NULL
--                 AND (
--                     (
--                         select count(id2)
--                         from (
--                                 select *
--                                 from (
--                                         (
--                                             SELECT to_number(COLUMN_VALUE) as id1
--                                             FROM xmltable(donViNhan)
--                                             ORDER BY id1
--                                         ) t1
--                                         LEFT JOIN (
--                                             SELECT to_number(COLUMN_VALUE) as id2
--                                             FROM xmltable(nv.DON_VI_NHAN)
--                                             ORDER BY id2
--                                         ) t2 ON id1 = id2
--                                     )
--                             )
--                     ) != 0
--                 )
--             ))
--         AND (
--             sT = ''
--             OR LOWER(nv.NOI_DUNG) LIKE sT
--             )
--         ORDER BY nv.ID DESC
--     )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
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
            FROM QT_KEO_DAI_CONG_TAC
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
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
        FROM (
                 SELECT
                        kdct.ID             as  "id",
                        kdct.SHCC           as  "shcc",

                        (SELECT COUNT(*)
                         FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                  LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                                OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                    timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                    timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                  ))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE ST
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                                OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                                OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                    timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                    timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                  ))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE ST
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                                OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                                OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                    timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                    timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                  ))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE ST
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                                OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                                OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                    timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                    timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                  ))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE ST
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                                OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                                OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                              OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                              OR (listShcc IS NULL AND listDv IS NULL))
                              AND (timeType IS NULL OR (
                                    timeType = 0 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                                  ) OR (
                                    timeType = 1 AND (kdct_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct_temp.KET_THUC <= toYear)
                                  ))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE ST
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                                OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachBatDauType",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        cb.PHAI AS "phai",
                        cb.NGAY_SINH AS "ngaySinh",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        CD.MA   AS "maChucDanh",
                        CD.TEN  AS "tenChucDanh",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC ) R
                FROM (SELECT *
                        FROM QT_KEO_DAI_CONG_TAC
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
                         LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                         LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

                ORDER BY kdct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
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

    FROM QT_KEO_DAI_CONG_TAC kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

    WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
        OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
      OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
      OR (listShcc IS NULL AND listDv IS NULL))
      AND (timeType IS NULL OR (
            timeType = 0 AND (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct.BAT_DAU <= toYear)
          ) OR (
            timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct.KET_THUC <= toYear)
          ))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(kdct.SO_HIEU_VAN_BAN) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        kdct.ID             as  "id",
                        kdct.SHCC           as  "shcc",
                        kdct.BAT_DAU        as  "batDau",
                        kdct.BAT_DAU_TYPE   as  "batDauType",
                        kdct.KET_THUC       as  "ketThuc",
                        kdct.KET_THUC_TYPE  as  "ketThucType",
                        kdct.SO_HIEU_VAN_BAN        as  "soHieuVanBan",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        cb.PHAI AS "phai",
                        cb.NGAY_SINH AS "ngaySinh",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        CD.MA   AS "maChucDanh",
                        CD.TEN  AS "tenChucDanh",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
                 FROM QT_KEO_DAI_CONG_TAC kdct
                          LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

                WHERE (((listShcc IS NULL) AND (listDv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL))
                    OR (((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level) from dual connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                  OR (listDv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDv, '[^,]+', 1, level) from dual connect by regexp_substr(listDv, '[^,]+', 1, level) is not null))
                  OR (listShcc IS NULL AND listDv IS NULL))
                  AND (timeType IS NULL OR (
                        timeType = 0 AND (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                      ) OR (
                        timeType = 1 AND (kdct.KET_THUC IS NOT NULL AND (fromYear IS NULL OR kdct.KET_THUC >= fromYear)) AND (toYear IS NULL OR kdct.KET_THUC <= toYear)
                      ))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                    OR LOWER(kdct.SO_HIEU_VAN_BAN) LIKE ST)
                 ORDER BY kdct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

