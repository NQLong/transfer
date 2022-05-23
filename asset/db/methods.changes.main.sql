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
        ) OR (qtcv.MA_CHUC_VU IN ('003', '005', '007', '009', '011', '013') AND qtcv.MA_DON_VI IN (
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
    loaiVanBan STRING(10);
    loaiCongVan STRING(10);
    soCongVan STRING(200);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    begin
        SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

        select MAX(SO_DI) into maxThuTu from HCTH_CONG_VAN_DI WHERE donViGui = DON_VI_GUI and (NGAY_GUI > nam) AND LOAI_CONG_VAN = loaiCongVan;

        SELECT dvg.TEN_VIET_TAT into tenVietTatDonViGui
        FROM DM_DON_VI dvg
        WHERE dvg.MA = donViGui;

        SELECT lcv.TEN_VIET_TAT into loaiVanBan
        FROM  HCTH_CONG_VAN_DI hcthCVD LEFT JOIN  DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
        WHERE hcthCVD.ID = ma;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;

    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

--     IF tenVietTatDonViGui IS NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV';
--     ELSIF tenVietTatDonViGui IS NULL AND loaiVanBan IS NOT NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/' + loaiVanBan || '-XHNV';
--     ELSIF tenVietTatDonViGui IS NOT NULL AND loaiVanBan IS NULL THEN
--         soCongVan := TO_CHAR(maxThuTu) || '/XHNV-' || tenVietTatDonViGui;
--     ELSE
--         soCongVan := TO_CHAR(maxThuTu) || '/' || loaiVanBan || '-XHNV-' || tenVietTatDonViGui;
--     end if;

    soCongVan := TO_CHAR(maxThuTu) || '/';
    IF loaiVanBan IS NOT NULL THEN
        soCongVan := soCongVan || loaiVanBan || '-';
    end if;

    soCongVan := soCongVan || 'XHNV';
    IF tenVietTatDonViGui IS NOT NULL THEN
        soCongVan := soCongVan || '-' || tenVietTatDonViGui;
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
        ORDER BY hs.THOI_GIAN DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(filter IN STRING, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
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
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        tnvn.TEN AS "tenNoiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by null).getclobval(), ' - ')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",
                        cb.NGAY_SINH AS "ngaySinh",
                        cb.PHAI AS "phai",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                         LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
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
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
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
                 ORDER BY qtdnn.NGAY_DI DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          filter IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
    list_shcc STRING(100);
    list_dv STRING(100);
    fromYear NUMBER;
    toYear NUMBER;
    timeType NUMBER;
    loaiHocVi STRING(100);
    mucDich STRING(100);
    tinhTrangCongTac NUMBER;
    tinhTrangBaoCao NUMBER;
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
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
             LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
        AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
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
                AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
            ) OR (
                timeType = 4
                AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
            ))
        AND (tinhTrangCongTac IS NULL OR
             (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
             (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
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
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",
                        qtdnn.SO_QD_TIEP_NHAN AS "soQdTiepNhan",
                        qtdnn.NOI_DUNG_TIEP_NHAN AS "noiDungTiepNhan",
                        tnvn.TEN AS "tenNoiDungTiepNhan",
                        qtdnn.NGAY_QD_TIEP_NHAN AS "ngayQdTiepNhan",
                        qtdnn.NGAY_VE_NUOC AS "ngayVeNuoc",
                        qtdnn.BAO_CAO_TINH_TRANG AS "baoCaoTinhTrang",
                        qtdnn.BAO_CAO_TEN AS "baoCaoTen",
                        qtdnn.BAO_CAO_LY_DO_TRA_VE AS "baoCaoLyDoTraVe",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, ' - ').extract('//text()') order by null).getclobval(), ' - ')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                         LEFT JOIN DM_TIEP_NHAN_VE_NUOC tnvn ON (qtdnn.NOI_DUNG_TIEP_NHAN = tnvn.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrangCongTac IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL) AND (tinhTrangBaoCao IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (loaiHocVi IS NULL OR cb.HOC_VI IN (SELECT regexp_substr(loaiHocVi, '[^,]+', 1, level) from dual connect by regexp_substr(loaiHocVi, '[^,]+', 1, level) is not null))
                    AND (mucDich IS NULL OR qtdnn.MUC_DICH IN (SELECT regexp_substr(mucDich, '[^,]+', 1, level) from dual connect by regexp_substr(mucDich, '[^,]+', 1, level) is not null))
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
                            AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                        ) OR (
                            timeType = 4
                            AND (qtdnn.NGAY_QD_TIEP_NHAN IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN >= fromYear))
                            AND (toYear IS NULL OR qtdnn.NGAY_QD_TIEP_NHAN <= toYear)
                        ))
                    AND (tinhTrangCongTac IS NULL OR
                         (tinhTrangCongTac = 1 AND qtdnn.NGAY_VE < today and (qtdnn.SO_QD_TIEP_NHAN IS NOT NULL OR TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) < 30)) OR
                         (tinhTrangCongTac = 2 AND qtdnn.NGAY_VE < today and qtdnn.SO_QD_TIEP_NHAN IS NULL and TRUNC(1 / 24 / 60 / 60 / 1000 * (qtdnn.NGAY_VE - qtdnn.NGAY_DI)) >= 30) OR
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
                 ORDER BY qtdnn.NGAY_DI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DON_VI_TRA_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING, searchTerm IN STRING,
                                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc STRING (100);
    listDv STRING (100);
    fromYear NUMBER(20);
    toYear NUMBER(20);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDv') INTO listDv FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear' RETURNING NUMBER) INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear' RETURNING NUMBER) INTO toYear FROM DUAL;


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

DROP FUNCTION QT_HOP_DONG_DVTL_TN_SEARCH_PAGE;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnts.ID    AS "id",
                        qtnts.SHCC  AS "shcc",
                        qtnts.NOI_DUNG  AS "noiDung",
                        qtnts.BAT_DAU   AS "batDau",
                        qtnts.BAT_DAU_TYPE   AS "batDauType",
                        qtnts.KET_THUC   AS "ketThuc",
                        qtnts.KET_THUC_TYPE   AS "ketThucType",
                        qtnts.TRO_LAI_CONG_TAC  AS "troLaiCongTac",

                        today   AS "today",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM QT_NGHI_THAI_SAN qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType IS NULL
                        OR (timeType = 0 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                        OR (timeType = 1 AND (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                  AND (tinhTrang IS NULL OR
                       (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                       (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                        (qtnts.KET_THUC < today AND tinhTrang = 1))))
                ORDER BY qtnts.BAT_DAU DESC
             );
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_THAI_SAN
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
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
                        qtnts.SHCC                        AS      "shcc",

                        (SELECT COUNT(*)
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "soLanNghi",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.NOI_DUNG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachNoiDung",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                          OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType IS NULL
                                OR (timeType = 0 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 1 AND (qtnts_temp.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.KET_THUC <= toYear)))
                          AND (tinhTrang IS NULL OR
                               (qtnts_temp.BAT_DAU > today AND tinhTrang = 3) OR
                               (qtnts_temp.BAT_DAU <= today AND qtnts_temp.KET_THUC >= today AND tinhTrang = 2) OR
                                (qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachBatDauType",

                        today   AS "today",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM (SELECT *
                      FROM QT_NGHI_THAI_SAN
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                    ORDER BY qtnts.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_THAI_SAN qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
      OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType IS NULL
            OR (timeType = 0 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
            OR (timeType = 1 AND (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
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
        FROM (
                 SELECT qtnts.ID    AS "id",
                        qtnts.SHCC  AS "shcc",
                        qtnts.NOI_DUNG  AS "noiDung",
                        qtnts.BAT_DAU   AS "batDau",
                        qtnts.BAT_DAU_TYPE   AS "batDauType",
                        qtnts.KET_THUC   AS "ketThuc",
                        qtnts.KET_THUC_TYPE   AS "ketThucType",
                        qtnts.TRO_LAI_CONG_TAC  AS "troLaiCongTac",

                        today   AS "today",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM QT_NGHI_THAI_SAN qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType IS NULL) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(list_shcc, '[^,]+', 1, level) from dual connect by regexp_substr(list_shcc, '[^,]+', 1, level) is not null))
                  OR (list_dv IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(list_dv, '[^,]+', 1, level) from dual connect by regexp_substr(list_dv, '[^,]+', 1, level) is not null))
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType IS NULL
                        OR (timeType = 0 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                        OR (timeType = 1 AND (qtnts.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnts.KET_THUC >= fromYear)) AND (toYear IS NULL OR qtnts.KET_THUC <= toYear)))
                  AND (tinhTrang IS NULL OR
                       (qtnts.BAT_DAU > today AND tinhTrang = 3) OR
                       (qtnts.BAT_DAU <= today AND qtnts.KET_THUC >= today AND tinhTrang = 2) OR
                        (qtnts.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                    OR LOWER(qtnts.NOI_DUNG) LIKE ST)
                ORDER BY qtnts.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;

/
--EndMethod--

DROP FUNCTION QT_NGHI_VIEC_GROUP_PAGE;
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
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
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
                     cv.MA              AS                            "maChucVu",
                     cv.TEN             AS                            "tenChucVu",

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
                       LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
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

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_GET_DATA(time IN NUMBER, NHAN_SU_DON_VI OUT SYS_REFCURSOR,
                                        QT_DI_NUOC_NGOAI OUT SYS_REFCURSOR,
                                        QT_CONG_TAC_TRONG_NUOC OUT SYS_REFCURSOR, QT_NGHI_PHEP OUT SYS_REFCURSOR,
                                        QT_NGHI_THAI_SAN OUT SYS_REFCURSOR,
                                        NHAN_SU_CONG_TAC OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    DATA_CAN_BO SYS_REFCURSOR;
    today       NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;

    OPEN QT_NGHI_PHEP FOR
        SELECT "numOfStaff",
               "mucDich",
               DM_NP.TEN as "tenMucDich"
        FROM (SELECT COUNT(NP.SHCC) as "numOfStaff",
                     NP.LY_DO       as "mucDich",
                     today          AS "today"
              FROM QT_NGHI_PHEP NP
              WHERE NP.BAT_DAU IS NOT NULL
                AND (
                      (time IS NULL AND NP.BAT_DAU <= today AND NP.KET_THUC >= today)
                      OR
                      NP.BAT_DAU >= time
                  )
              GROUP BY NP.LY_DO)
                 LEFT JOIN DM_NGHI_PHEP DM_NP
                           ON "mucDich" = DM_NP.MA;

    OPEN QT_NGHI_THAI_SAN FOR
        SELECT COUNT(NP.SHCC) as "numOfStaff"
        FROM QT_NGHI_THAI_SAN NP
        WHERE NP.BAT_DAU IS NOT NULL
          AND (
                (time IS NULL AND NP.BAT_DAU <= today AND NP.KET_THUC >= today)
                OR
                NP.BAT_DAU >= time
            );

    OPEN DATA_CAN_BO FOR
        SELECT COUNT(CASE WHEN CB.SHCC IS NOT NULL THEN 1 END) AS "tongCB"

        FROM TCHC_CAN_BO CB
        WHERE CB.NGAY_NGHI IS NULL
          AND (time IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC <= time));

    OPEN NHAN_SU_DON_VI FOR
        SELECT "numOfStaff",
               "maDonVi",
               DV.MA_PL        as "maPL",
               DV.TEN          as "tenDonVi",
               DV.TEN_VIET_TAT as "tenVietTat"
        FROM (SELECT COUNT(CB.SHCC) as "numOfStaff",
                     CB.MA_DON_VI   as "maDonVi"
              FROM TCHC_CAN_BO CB
              WHERE NGAY_NGHI IS NULL
                AND (time IS NULL OR
                     (CB.NGAY_BAT_DAU_CONG_TAC >= time))
              GROUP BY CB.MA_DON_VI)
                 LEFT JOIN DM_DON_VI DV
                           ON "maDonVi" = DV.MA;


    OPEN QT_DI_NUOC_NGOAI FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (SELECT COUNT(DNN.SHCC) as "numOfStaff",
                     DNN.MUC_DICH    as "mucDich",
                     today           AS "today"
              FROM QT_DI_NUOC_NGOAI DNN
              WHERE DNN.NGAY_DI IS NOT NULL
                AND (
                      (time IS NULL AND DNN.NGAY_DI <= today AND DNN.NGAY_VE >= today)
                      OR
                      DNN.NGAY_DI >= time
                  )
              GROUP BY DNN.MUC_DICH)
                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI MD
                           ON "mucDich" = MD.MA;


    OPEN QT_CONG_TAC_TRONG_NUOC FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (SELECT COUNT(TN.SHCC) as "numOfStaff",
                     TN.VIET_TAT    as "mucDich"
              FROM QT_CONG_TAC_TRONG_NUOC TN
              WHERE TN.BAT_DAU IS NOT NULL
                AND (
                      (time IS NULL AND TN.BAT_DAU <= today AND TN.KET_THUC >= today)
                      OR
                      TN.BAT_DAU >= time
                  )
              GROUP BY TN.VIET_TAT)
                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC MD
                           ON "mucDich" = MD.MA;

    OPEN NHAN_SU_CONG_TAC FOR
        SELECT CB.NGAY_BAT_DAU_CONG_TAC                            AS "ngayCongTac",
               (CASE WHEN CB.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",
               CB.NGACH                                            AS "ngach",
               NGACH.TEN                                           AS "tenNgach",
               CB.CHUC_DANH                                        AS "chucDanh",
               CB.MA_DON_VI                                        AS "donVi",
               HV.TEN                                              AS "hocVi",
               CB.NGAY_BIEN_CHE                                    AS "ngayVaoBienChe"
        FROM TCHC_CAN_BO CB
                 LEFT JOIN DM_NGACH_CDNN NGACH ON NGACH.MA = CB.NGACH
                 LEFT JOIN DM_TRINH_DO HV ON HV.MA = CB.HOC_VI
        WHERE NGAY_NGHI IS NULL
          AND (time IS NULL OR
               (CB.NGAY_BAT_DAU_CONG_TAC >= time));

    RETURN DATA_CAN_BO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_TRACH_NHIEM_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                    filter IN STRING, searchTerm IN STRING,
                                                    totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_TRACH_NHIEM hd
             LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
             LEFT JOIN TCHC_CAN_BO cbtl ON hd.NGUOI_DUOC_THUE = cbtl.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
    WHERE (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(cbtl.HO || ' ' || cbtl.TEN)) LIKE sT
        OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                     hd.MA                   AS              "ma",
                     cbtl.HO                 AS              "ho",
                     cbtl.TEN                AS              "ten",
                     cbtl.PHAI               AS              "phai",
                     cbtl.NGAY_SINH          AS              "ngaySinh",
                     hd.NGUOI_KY             as              "nguoiKy",
                     cbk.SHCC                as              "shccNguoiKy",
                     cbk.HO                  as              "hoNguoiKy",
                     cbk.TEN                 as              "tenNguoiKy",
                     hd.SO_HOP_DONG          as              "soHopDong",
                     hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                     hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                     hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                     dv.TEN                  as              "tenDiaDiemLamViec",
                     hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                     hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                     hd.NGACH                as              "ngach",
                     hd.HIEU_LUC_HOP_DONG    as              "hieuLucHopDong",
                     hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                     hd.TIEN_LUONG           as              "tienLuong",
                     ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R

              FROM QT_HOP_DONG_TRACH_NHIEM hd
                       LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                       LEFT JOIN TCHC_CAN_BO cbtl ON hd.NGUOI_DUOC_THUE = cbtl.SHCC
                       LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
              WHERE (searchTerm = ''
                  OR LOWER(hd.NGUOI_KY) LIKE sT
                  OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                  OR LOWER(TRIM(cbtl.HO || ' ' || cbtl.TEN)) LIKE sT
                  OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
                  OR LOWER(hd.SO_HOP_DONG) LIKE sT)
              ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC)
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
                     cv.MA              AS                            "maChucVu",
                     cv.TEN             AS                            "tenChucVu",

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
                       LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
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

              ORDER BY qtnv.NGAY_NGHI DESC NULLS LAST , qtnv.SO_QUYET_DINH NULLS LAST, qtnv.SHCC NULLS LAST, cb.HO NULLS LAST);
    RETURN my_cursor;

END;

/
--EndMethod--

