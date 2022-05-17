CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_ALL_STAFF(
    congVanId IN NUMBER
)   RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
    canBoNhan STRING(200);
BEGIN
    SELECT hcth.CAN_BO_NHAN into canBoNhan FROM HCTH_CONG_VAN_DI hcth WHERE hcth.ID = congVanId;
    OPEN CVD_INFO FOR
        SELECT UNIQUE cb.email as "email"
        FROM TCHC_CAN_BO cb
            LEFT JOIN QT_CHUC_VU qtcv ON qtcv.SHCC = cb.SHCC AND qtcv.CHUC_VU_CHINH = 1
        WHERE cb.SHCC IN (
            SELECT regexp_substr(canBoNhan, '[^,]+', 1, level)
            FROM dual
            CONNECT BY regexp_substr(canBoNhan, '[^,]+', 1, level) IS NOT NULL
        ) OR (qtcv.MA_CHUC_VU IN ('003', '009', '011', '013', '015', '022') AND qtcv.MA_DON_VI IN (
            SELECT dvn.DON_VI_NHAN
            FROM HCTH_DON_VI_NHAN dvn
            WHERE dvn.LOAI = 'DI'
            AND dvn.MA = congVanId)
            );
    RETURN CVD_INFO;
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
                                  )
                          )
                 ORDER BY hcthCVD.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
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
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    donViNhan   Number;
    canBoNhan   String(128);
    shccCanBo   String(32);
    nguoiTao    String(32);
    donViCanBo  String(128);
    canBoType   String(32);
    loaiNhiemVu String(32);
    lienPhong   Number(1);
    doUuTien    String(16);
BEGIN

    SELECT JSON_VALUE(filterParam, '$.donViNhan') INTO donViNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoNhan') INTO canBoNhan FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.shccCanBo') INTO shccCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.canBoType') INTO canBoType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.donViCanBo') INTO donViCanBo FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.loaiNhiemVu') INTO loaiNhiemVu FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.lienPhong') INTO lienPhong FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.doUuTien') INTO doUuTien FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.nguoiTao') INTO nguoiTao FROM DUAL;


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
      and
      -- filter
        (
                    sT = ''
                OR LOWER(nv.NOI_DUNG) LIKE sT
                OR LOWER(nv.TIEU_DE) LIKE sT
            )
      and (
                loaiNhiemVu is NULL or
                (loaiNhiemVu = 'NHIEM_VU_CAC_DON_VI' and
                 Exists(SELECT dvn.id from HCTH_DON_VI_NHAN dvn where dvn.LOAI = 'NHIEM_VU' and dvn.MA = nv.id)) or
                (loaiNhiemVu = 'NHIEM_VU_DON_VI' and
                 (donViCanBo is not null and Exists(
                         select dvn.id
                         from HCTH_DON_VI_NHAN dvn
                         where dvn.MA = nv.id
                           and dvn.LOAI = 'NHIEM_VU'
                           and dvn.DON_VI_NHAN in
                               (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                from dual
                                connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                     ))) or
                (loaiNhiemVu = 'NHIEM_VU_CUA_BAN' and nv.NGUOI_TAO = shccCanBo) or
                (loaiNhiemVu = 'NHIEM_VU_THAM_GIA' and (EXISTS(select cbn.id
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
                        )))
                    ))
      and (
        lienPhong is NULL or nv.LIEN_PHONG = lienPhong
        )
      and (
        doUuTien is NULL or nv.DO_UU_TIEN = doUuTien
        )
      and (
                donViNhan is NULL or exists(select dvn.id
                                            from HCTH_DON_VI_NHAN dvn
                                            where dvn.LOAI = 'NHIEM_VU'
                                              and dvn.MA = nv.id
                                              and dvn.DON_VI_NHAN = donViNhan)
        )
      and (
                canBoNhan is NULL or exists(select cbn.id
                                            from HCTH_CAN_BO_NHAN cbn
                                            where cbn.LOAI = 'NHIEM_VU'
                                              and cbn.MA = nv.id
                                              and cbn.CAN_BO_NHAN = canBoNhan)
        )
      and (
        nguoiTao is NULL or nv.NGUOI_TAO = nguoiTao
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

                     (select MAX(nvh.THOI_GIAN)
                      from HCTH_HISTORY nvh
                      where nvh.LOAI = 'NHIEM_VU'
                        and nvh.KEY = nv.ID)                              as chinhSuaLanCuoi,


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
                and
                -- filter
                  (
                              sT = ''
                          OR LOWER(nv.NOI_DUNG) LIKE sT
                          OR LOWER(nv.TIEU_DE) LIKE sT
                      )
                and (
                          loaiNhiemVu is NULL or
                          (loaiNhiemVu = 'NHIEM_VU_CAC_DON_VI' and
                           Exists(SELECT dvn.id
                                  from HCTH_DON_VI_NHAN dvn
                                  where dvn.LOAI = 'NHIEM_VU'
                                    and dvn.MA = nv.id)) or
                          (loaiNhiemVu = 'NHIEM_VU_DON_VI' and
                           (donViCanBo is not null and Exists(
                                   select dvn.id
                                   from HCTH_DON_VI_NHAN dvn
                                   where dvn.MA = nv.id
                                     and dvn.LOAI = 'NHIEM_VU'
                                     and dvn.DON_VI_NHAN in
                                         (select regexp_substr(donViCanBo, '[^,]+', 1, level)
                                          from dual
                                          connect by regexp_substr(donViCanBo, '[^,]+', 1, level) is not null)
                               ))) or
                          (loaiNhiemVu = 'NHIEM_VU_CUA_BAN' and nv.NGUOI_TAO = shccCanBo) or
                          (loaiNhiemVu = 'NHIEM_VU_THAM_GIA' and (EXISTS(select cbn.id
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
                                  )))
                              ))
                and (
                  lienPhong is NULL or nv.LIEN_PHONG = lienPhong
                  )
                and (
                  doUuTien is NULL or nv.DO_UU_TIEN = doUuTien
                  )
                and (
                          donViNhan is NULL or exists(select dvn.id
                                                      from HCTH_DON_VI_NHAN dvn
                                                      where dvn.LOAI = 'NHIEM_VU'
                                                        and dvn.MA = nv.id
                                                        and dvn.DON_VI_NHAN = donViNhan)
                  )
                and (
                          canBoNhan is NULL or exists(select cbn.id
                                                      from HCTH_CAN_BO_NHAN cbn
                                                      where cbn.LOAI = 'NHIEM_VU'
                                                        and cbn.MA = nv.id
                                                        and cbn.CAN_BO_NHAN = canBoNhan)
                  )
                and (
                  nguoiTao is NULL or nv.NGUOI_TAO = nguoiTao
                  )
             )
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
                                OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)
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
                                OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)
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
                                OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)
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
                                OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)
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
                                OR LOWER(kdct_temp.SO_QUYET_DINH) LIKE ST)
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
        OR LOWER(kdct.SO_QUYET_DINH) LIKE ST);

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
                        kdct.SO_QUYET_DINH AS "soQuyetDinh",
                        kdct.NGAY_QUYET_DINH AS "ngayQuyetDinh",

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
                    OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
                 ORDER BY kdct.BAT_DAU DESC
             )
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
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level) from dual connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
        OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level) from dual connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
        OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
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
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",
                        qtnckh.MA_SO                                                   AS "maSo",
                        qtnckh.CAP_QUAN_LY                                             AS "capQuanLy",
                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        qtnckh.IN_LLKH                                                  AS "inLLKH",

                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnckh.BAT_DAU DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE ((maSoCanBo IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(maSoCanBo, '[^,]+', 1, level) from dual connect by regexp_substr(maSoCanBo, '[^,]+', 1, level) is not null))
                    OR (maDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(maDonVi, '[^,]+', 1, level) from dual connect by regexp_substr(maDonVi, '[^,]+', 1, level) is not null))
                    OR (loaiHocVi IS NOT NULL AND cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
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
                 ORDER BY qtnckh.BAT_DAU DESC NULLS LAST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCHC_CAN_BO_GET_DATA_ALL(mtcb IN STRING, QT_CHUC_VU OUT SYS_REFCURSOR, QT_DAO_TAO OUT SYS_REFCURSOR,
                                         QT_HOC_TAP_CONG_TAC OUT SYS_REFCURSOR,
                                         TO_CHUC_KHAC OUT SYS_REFCURSOR,
                                         QUAN_HE_GIA_DINH OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    CAN_BO SYS_REFCURSOR;
BEGIN

    OPEN CAN_BO FOR
        SELECT STAFF.SHCC                                             AS "shcc",
               STAFF.HO                                               AS "ho",
               STAFF.TEN                                              AS "ten",
               STAFF.BI_DANH                                          AS "otherName",
               staff.NGAY_SINH                                        as "ngaySinh",
               (CASE WHEN staff.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",

               xaNoiSinh.TEN_PHUONG_XA                                as "xaNoiSinh",
               huyenNoiSinh.TEN_QUAN_HUYEN                            as "huyenNoiSinh",
               tinhNoiSinh.TEN                                        AS "tinhNoiSinh",

               xaNguyenQuan.TEN_PHUONG_XA                             AS "xaNguyenQuan",
               huyenNguyenQuan.TEN_QUAN_HUYEN                         AS "huyenNguyenQuan",
               tinhNguyenQuan.TEN                                     AS "tinhNguyenQuan",

               danToc.TEN                                             as "danToc",
               tonGiao.TEN                                            as "tonGiao",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               staff.THUONG_TRU_SO_NHA                                as "soNhaThuongTru",

               xaHienTai.TEN_PHUONG_XA                                as "xaHienTai",
               huyenHienTai.TEN_QUAN_HUYEN                            as "huyenHienTai",
               tinhHienTai.ten                                        as "tinhHienTai",
               staff.HIEN_TAI_SO_NHA                                  as "soNhaHienTai",

               staff.NGHE_NGHIEP_CU                                   as "ngheTuyen",
               staff.NGAY_BAT_DAU_CONG_TAC                            as "ngayTuyen",
               staff.DON_VI_TUYEN_DUNG                                as "coQuanTuyen",
               staff.NGACH                                            as "maNgach",
               ngach.TEN                                              as "tenNgach",
               staff.NGAY_HUONG_LUONG                                 as "ngayHuongLuong",
               staff.BAC_LUONG                                        as "bacLuong",
               staff.HE_SO_LUONG                                      as "heSoLuong",
               staff.TRINH_DO_PHO_THONG                               as "phoThong",
               hocVi.TEN                                              as "hocVi",
               staff.NGAY_VAO_DANG                                    as "ngayVaoDang",
               staff.NGAY_VAO_DANG_CHINH_THUC                         as "ngayVaoDangChinhThuc",
               staff.NGAY_NHAP_NGU                                    as "ngayNhapNgu",
               staff.NGAY_XUAT_NGU                                    as "ngayXuatNgu",
               staff.QUAN_HAM_CAO_NHAT                                as "quanHam",
               staff.SO_TRUONG                                        as "soTruong",
               staff.SUC_KHOE                                         as "sucKhoe",
               staff.CHIEU_CAO                                        as "chieuCao",
               staff.CAN_NANG                                         as "canNang",
               nhomMau.TEN                                            as "nhomMau",
               staff.HANG_THUONG_BINH                                 as "hangThuongBinh",
               staff.GIA_DINH_CHINH_SACH                              as "giaDinhChinhSach",
               staff.CMND                                             as "cmnd",
               staff.CMND_NGAY_CAP                                    as "ngayCapCmnd",
               staff.CMND_NOI_CAP                                     as "noiCapCmnd",
               staff.SO_BHXH                                          as "soBaoHiemXaHoi",
               (select rtrim(xmlagg(xmlelement(e, daoTao.CHUYEN_NGANH, ' - ', daoTao.TRINH_DO, ', ').extract('//text()') order by
                                    null).getclobval(), ', ')
                FROM QT_DAO_TAO daoTao
                 LEFT JOIN DM_BANG_DAO_TAO bdt on daoTao.LOAI_BANG_CAP = bdt.MA
                WHERE daoTao.SHCC = mtcb AND daoTao.LOAI_BANG_CAP = 5)       AS "ngoaiNgu"
        FROM TCHC_CAN_BO STAFF
                 LEFT JOIN DM_PHUONG_XA xaNoiSinh
                           ON STAFF.MA_XA_NOI_SINH = xaNoiSinh.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNoiSinh ON huyenNoiSinh.MA_QUAN_HUYEN = STAFF.MA_HUYEN_NOI_SINH
                 LEFT JOIN DM_TINH_THANH_PHO tinhNoiSinh ON STAFF.MA_TINH_NOI_SINH = tinhNoiSinh.MA
                 LEFT JOIN DM_PHUONG_XA xaNguyenQuan ON STAFF.MA_XA_NGUYEN_QUAN = xaNguyenQuan.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNguyenQuan ON STAFF.MA_HUYEN_NGUYEN_QUAN = huyenNguyenQuan.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhNguyenQuan ON STAFF.MA_TINH_NGUYEN_QUAN = tinhNguyenQuan.MA
                 LEFT JOIN DM_DAN_TOC danToc ON STAFF.DAN_TOC = danToc.MA
                 LEFT JOIN DM_TON_GIAO tonGiao ON STAFF.TON_GIAO = tonGiao.MA
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STAFF.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STAFF.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STAFF.THUONG_TRU_MA_TINH = tinhThuongTru.MA
                 LEFT JOIN DM_PHUONG_XA xaHienTai ON STAFF.HIEN_TAI_MA_XA = xaHienTai.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenHienTai ON STAFF.HIEN_TAI_MA_HUYEN = huyenHienTai.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhHienTai ON STAFF.HIEN_TAI_MA_TINH = tinhHienTai.MA
                 LEFT JOIN DM_NGACH_CDNN ngach ON ngach.MA = staff.NGACH
                 left join DM_TRINH_DO hocVi ON hocVi.MA = staff.HOC_VI
                 LEFT JOIN DM_NHOM_MAU nhomMau ON nhomMau.MA = staff.NHOM_MAU
        WHERE STAFF.SHCC = mtcb;

    OPEN QT_CHUC_VU FOR
        SELECT DM_DON_VI.TEN      AS "donVi",
               DM_CHUC_VU.TEN     AS "chucVu",
               DM_CHUC_VU.PHU_CAP as "phuCapChucVu"
        FROM (SELECT MAX(cv1.NGAY_RA_QD) AS maxNgayRaQD
              FROM QT_CHUC_VU cv1
              WHERE cv1.SHCC = mtcb
                AND cv1.CHUC_VU_CHINH = 1
              GROUP BY cv1.SHCC) cvMax
                 INNER JOIN QT_CHUC_VU cv ON cv.NGAY_RA_QD = cvMax.maxNgayRaQD
                 LEFT JOIN DM_CHUC_VU ON DM_CHUC_VU.MA = CV.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI ON DM_DON_VI.MA = CV.MA_DON_VI
                 LEFT JOIN DM_BO_MON ON DM_BO_MON.MA = CV.MA_BO_MON
        WHERE cv.SHCC = mtcb;

    OPEN QUAN_HE_GIA_DINH FOR
        SELECT quanhe.HO_TEN       AS "hoTen",
               quanhe.NAM_SINH     AS "namSinh",
               quanhe.NGHE_NGHIEP  AS "ngheNghiep",
               quanhe.NOI_CONG_TAC AS "noiCongTac",
               qh.TEN              AS "moiQuanHe",
               qh.LOAI             AS "loai"
        FROM QUAN_HE_CAN_BO quanhe
                 LEFT JOIN DM_QUAN_HE_GIA_DINH qh ON quanhe.MOI_QUAN_HE = qh.MA
        WHERE quanhe.SHCC = mtcb;

    OPEN QT_HOC_TAP_CONG_TAC FOR
        SELECT HTCT.BAT_DAU       as "batDau",
               HTCT.KET_THUC_TYPE as "ketThucType",
               HTCT.KET_THUC      as "ketThuc",
               htct.BAT_DAU_TYPE  as "batDauType",
               HTCT.NOI_DUNG      as "noiDung"
        FROM QT_HOC_TAP_CONG_TAC HTCT
        where htct.SHCC = mtcb;

    open TO_CHUC_KHAC FOR
        SELECT tck.NGAY_THAM_GIA as "ngayThamGia",
               tck.TEN_TO_CHUC   as "tenToChuc",
               tck.MO_TA         as "moTa"
        FROM TCCB_TO_CHUC_KHAC TCK
        where tck.SHCC = mtcb;

    open QT_DAO_TAO for
        select qtdt.TEN_TRUONG    as "coSo",
               qtdt.CHUYEN_NGANH  as "chuyenNganh",
               qtdt.BAT_DAU       as "batDau",
               qtdt.BAT_DAU_TYPE  as "batDauType",
               qtdt.KET_THUC      as "ketThuc",
               qtdt.KET_THUC_TYPE as "ketThucType",
               qtdt.HINH_THUC     as "hinhThuc",
               qtdt.LOAI_BANG_CAP as "loaiBangCap",
               qtdt.TRINH_DO      as "trinhDo",
               bdt.TEN            as "tenLoaiBangCap",
               htdt.TEN           as "tenHinhThuc",
               TDDT.TEN           AS "tenTrinhDo"
        from QT_DAO_TAO qtdt
                 LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                 LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
        where qtdt.SHCC = mtcb;

    return CAN_BO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
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
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
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

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                         list_shcc IN STRING, list_dv IN STRING,
                                                         fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                         totalItem OUT NUMBER,
                                                         pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DON_VI_TRA_LUONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.SHCC = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DON_VI_TRA_LUONG = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH cdcm on hd.CHUC_DANH = cdcm.MA
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
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
              WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                  OR (((list_shcc IS NOT NULL AND
                        ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR
                         (list_shcc = benA.SHCC)))
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
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

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SHCC_BY_DON_VI(maDonVi IN NUMBER) RETURN NUMBER
AS
    result  NUMBER(4);
BEGIN
    SELECT MAX(TO_NUMBER(SUBSTR(SHCC, 6))) INTO result
    FROM TCHC_CAN_BO cb
    WHERE SUBSTR(cb.SHCC, 1, 3) IN (SELECT PRE_SHCC FROM DM_DON_VI dv WHERE dv.MA = maDonVi);
    RETURN result;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
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
                        kdct.SO_QUYET_DINH AS "soQuyetDinh",
                        kdct.NGAY_QUYET_DINH AS "ngayQuyetDinh",

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
                    OR LOWER(kdct.SO_QUYET_DINH) LIKE ST)
                 ORDER BY kdct.BAT_DAU DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

