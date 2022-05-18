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
           OR (qtcv.MA_CHUC_VU in ('013', '005', '003', '016', '009', '007') AND qtcv.MA_DON_VI IN (
            SELECT dvn.DON_VI_NHAN
            FROM HCTH_DON_VI_NHAN dvn
            WHERE dvn.LOAI = 'DEN'
              and dvn.MA = key)
            );

    RETURN my_cursor;
END ;

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
                        hcthCVD.NOI_BO            AS                 "noiBo",
                        hcthCVD.TRANG_THAI        AS                 "trangThai",
                        hcthCVD.DON_VI_NHAN_NGOAI AS                 "donViNhanNgoai",
                        hcthCVD.LOAI_CONG_VAN     AS                 "loaiCongVan",
                        hcthCVD.SO_CONG_VAN       AS                 "soCongVan",
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

CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
IS
    maxThuTu number;
    tenVietTatDonViGui STRING(100);
    loaiCongVan STRING(10);
    soCongVan STRING(200);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    begin
        select MAX(SO_DI) into maxThuTu from HCTH_CONG_VAN_DI WHERE donViGui = DON_VI_GUI and (NGAY_GUI > nam);

        SELECT dvg.TEN_VIET_TAT into tenVietTatDonViGui
        FROM DM_DON_VI dvg
        WHERE dvg.MA = donViGui;

        SELECT lcv.TEN_VIET_TAT into loaiCongVan
        FROM  HCTH_CONG_VAN_DI hcthCVD LEFT JOIN  DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_CONG_VAN
        WHERE hcthCVD.ID = ma;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;

    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    IF tenVietTatDonViGui IS NULL AND loaiCongVan IS NULL THEN
        soCongVan := TO_CHAR(maxThuTu) || '/XHNV';
    ELSIF tenVietTatDonViGui IS NULL AND loaiCongVan IS NOT NULL THEN
        soCongVan := TO_CHAR(maxThuTu) || '/' + loaiCongVan || '-XHNV';
    ELSIF tenVietTatDonViGui IS NOT NULL AND loaiCongVan IS NULL THEN
        soCongVan := TO_CHAR(maxThuTu) || '/XHNV-' || tenVietTatDonViGui;
    ELSE
        soCongVan := TO_CHAR(maxThuTu) || '/' || loaiCongVan || '-XHNV-' || tenVietTatDonViGui;
    end if;

    update HCTH_CONG_VAN_DI hcthCVD set
    hcthCVD.SO_DI = maxThuTu,
    hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
    hcthCVD.SO_CONG_VAN = soCongVan
    WHERE hcthCVD.ID = ma;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_HISTORY_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING
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
        ORDER BY hs.THOI_GIAN;
    RETURN my_cursor;
END;

/
--EndMethod--

