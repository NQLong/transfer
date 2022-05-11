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
                     nv.TIEN_DO                                           AS "tienDo",


                     (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                            order by dvn.TEN
                            )
                         FROM DM_DON_VI dvn
                                  LEFT JOIN HCTH_DON_VI_NHAN hcthdvn on dvn.MA = hcthdvn.DON_VI_NHAN
                         WHERE hcthdvn.MA = nv.ID
                           AND hcthdvn.LOAI = 'NHIEM_VU'
                        )                     AS "danhSachDonViNhan",


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

