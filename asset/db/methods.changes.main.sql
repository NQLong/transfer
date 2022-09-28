CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_DOWNLOAD_EXCEL(
    filter IN STRING,
    scope IN STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER
) RETURN SYS_REFCURSOR
AS
    userShcc        NVARCHAR2(10);
    donViGui        NUMBER(20);
    donViNhan       NUMBER(20);
    loaiCongVan     NVARCHAR2(20);
    loaiVanBan      NVARCHAR2(100);
    donViNhanNgoai  NUMBER(20);
    canBoNhan       NVARCHAR2(10);
    status          NVARCHAR2(100);
    timeType        NUMBER(20);
    fromTime        NUMBER(20);
    toTime          NUMBER(20);
    CVD_INFO        SYS_REFCURSOR;
    departmentScope NVARCHAR2(512);
    globalScope     NVARCHAR2(512);
    userDepartments NVARCHAR2(100);
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT JSON_VALUE(scope, '$.DEPARTMENT') INTO departmentScope FROM DUAL;
    SELECT JSON_VALUE(scope, '$.GLOBAL') INTO globalScope FROM DUAL;

    SELECT JSON_VALUE(filter, '$.userDepartments') INTO userDepartments FROM DUAL;
    SELECT JSON_VALUE(filter, '$.userShcc') INTO userShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViGui') INTO donViGui FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViNhan') INTO donViNhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViNhanNgoai') INTO donViNhanNgoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.canBoNhan') INTO canBoNhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiCongVan') INTO loaiCongVan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiVanBan') INTO loaiVanBan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.status') INTO status FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toTime') INTO toTime FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI cvd
             LEFT JOIN DM_DON_VI dvg on (cvd.DON_VI_GUI = dvg.MA)
    WHERE (
                  ((userShcc is not null and (cvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                 from HCTH_CAN_BO_NHAN cbn
                                                                                 where cbn.ma = cvd.ID
                                                                                   and cbn.LOAI = 'DI'
                                                                                   and cvd.TRANG_THAI = 'DA_PHAT_HANH')))
                      or
                   (departmentScope is not null and userDepartments is not null and cvd.DON_VI_GUI is not null and
                    cvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                    cvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                      or
                   (globalScope is not null and cvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
                      )
                  AND (
                          (donViGui IS NULL OR donViGui = cvd.DON_VI_GUI)
                          AND (loaiVanBan IS NULL OR loaiVanBan = cvd.LOAI_VAN_BAN)
                          AND (loaiCongVan IS NULL OR loaiCongVan = cvd.LOAI_CONG_VAN)
                          AND (
                                      donViNhan IS NULL OR EXISTS(
                                      SELECT dvn.ID
                                      FROM HCTH_DON_VI_NHAN dvn
                                      WHERE dvn.MA = cvd.ID
                                        AND dvn.DON_VI_NHAN_NGOAI = 0
                                        AND dvn.LOAI = 'DI'
                                        AND dvn.DON_VI_NHAN = donViNhan
                                  ))
                          AND (
                                      donViNhanNgoai IS NULL OR EXISTS(
                                      SELECT dvn.ID
                                      FROM HCTH_DON_VI_NHAN dvn
                                      WHERE dvn.MA = cvd.ID
                                        AND dvn.DON_VI_NHAN_NGOAI = 1
                                        AND dvn.LOAI = 'DI'
                                        AND dvn.DON_VI_NHAN = donViNhanNgoai
                                  ))
                          AND (
                                      canBoNhan IS NULL OR EXISTS(
                                      SELECT cbn.ID
                                      FROM HCTH_CAN_BO_NHAN cbn
                                      WHERE cbn.MA = cvd.ID
                                        AND cbn.LOAI = 'DI'
                                        AND cbn.CAN_BO_NHAN = canBoNhan
                                  )
                              )
                          AND (status IS NULL OR status = cvd.TRANG_THAI)
                          and (
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
                                                                              AND cvd.NGAY_GUI IS NOT NULL
                                                                              AND cvd.NGAY_GUI >= fromTime
                                                                          )
                                                                      OR (
                                                                                  timeType = 2
                                                                              AND cvd.NGAY_KY IS NOT NULL
                                                                              AND cvd.NGAY_KY >= fromTime
                                                                          )
                                                                  )
                                                      )
                                              AND (
                                                              toTime IS NULL
                                                          OR (
                                                                      (
                                                                                  timeType = 1
                                                                              AND cvd.NGAY_GUI IS NOT NULL
                                                                              AND cvd.NGAY_GUI <= toTime
                                                                          )
                                                                      OR (
                                                                                  timeType = 2
                                                                              AND cvd.NGAY_KY IS NOT NULL
                                                                              AND cvd.NGAY_KY <= toTime
                                                                          )
                                                                  )
                                                      )
                                          )
                              )
                          AND (
                                      ST = ''
                                  OR LOWER(cvd.TRICH_YEU) LIKE ST
                                  OR LOWER(cvd.SO_CONG_VAN) LIKE ST
                              )
                      )
              );

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
                 SELECT cvd.ID            AS                     "id",
                        cvd.TRICH_YEU     AS                     "trichYeu",
                        cvd.NGAY_GUI      AS                     "ngayGui",
                        cvd.NGAY_KY       AS                     "ngayKy",
                        cvd.CAN_BO_NHAN   AS                     "maCanBoNhan",
                        cvd.TRANG_THAI    AS                     "trangThai",
                        cvd.LOAI_CONG_VAN AS                     "loaiCongVan",
                        cvd.SO_CONG_VAN   AS                     "soCongVan",
                        cvd.LOAI_VAN_BAN  AS                     "loaiVanBan",
                        dvg.MA            AS                     "maDonViGui",
                        dvg.TEN           AS                     "tenDonViGui",
                        lvb.TEN           AS                     "tenLoaiVanBan",

                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = cvd.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                 AS                     "maDonViNhan",
                        (
                            SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP (
                                ORDER BY hcthDVN.ID
                                )
                            FROM HCTH_DON_VI_NHAN hcthDVN
                            WHERE hcthDVN.MA = cvd.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                 AS                     "donViNhanNgoai",

                        (
                            SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvn.TEN
                                )
                            FROM DM_DON_VI dvn
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = cvd.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 0
                        )                 AS                     "danhSachDonViNhan",

                        (
                            SELECT LISTAGG(dvgcv.TEN, '; ') WITHIN GROUP (
                                ORDER BY dvgcv.TEN
                                )
                            FROM DM_DON_VI_GUI_CV dvgcv
                                     LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvgcv.ID = hcthDVN.DON_VI_NHAN
                            WHERE hcthDVN.MA = cvd.ID
                              AND hcthDVN.LOAI = 'DI'
                              AND hcthDVN.DON_VI_NHAN_NGOAI = 1
                        )                 AS                     "danhSachDonViNhanNgoai",

                        (SELECT LISTAGG(CASE
                                            WHEN cbn.HO IS NULL
                                                THEN cbn.TEN
                                            WHEN cbn.TEN IS NULL
                                                THEN cbn.HO
                                            WHEN DMCV.TEN IS NULL
                                                THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                            ELSE CONCAT(
                                                    CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                    cbn.TEN) END,
                                        '; ')
                                        WITHIN GROUP ( order by cbn.TEN ) as hoVaTenCanBo
                         FROM HCTH_CAN_BO_NHAN cb
                                  LEFT JOIN TCHC_CAN_BO cbn ON cb.CAN_BO_NHAN = cbn.SHCC
                                  LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                         WHERE cb.MA = cvd.ID
                           AND cb.LOAI = 'DI'
                        )
                                          AS                     "danhSachCanBoNhan",

                        ROW_NUMBER() OVER (ORDER BY cvd.ID DESC) R
                 FROM HCTH_CONG_VAN_DI cvd
                          LEFT JOIN DM_DON_VI dvg on (cvd.DON_VI_GUI = dvg.MA)
                          LEFT JOIN DM_LOAI_CONG_VAN lvb
                                    on cvd.LOAI_VAN_BAN is not null and lvb.ID = cvd.LOAI_VAN_BAN
                 WHERE (
                               ((userShcc is not null and (cvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                              from HCTH_CAN_BO_NHAN cbn
                                                                                              where cbn.ma = cvd.ID
                                                                                                and cbn.LOAI = 'DI'
                                                                                                and cvd.TRANG_THAI = 'DA_PHAT_HANH')))
                                   or
                                (departmentScope is not null and userDepartments is not null and
                                 cvd.DON_VI_GUI is not null and
                                 cvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                                 cvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                                   or
                                (globalScope is not null and
                                 cvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                    from dual
                                                    connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
                                   )
                               AND (
                                       (donViGui IS NULL OR donViGui = cvd.DON_VI_GUI)
                                       AND (loaiVanBan IS NULL OR loaiVanBan = cvd.LOAI_VAN_BAN)
                                       AND (loaiCongVan IS NULL OR loaiCongVan = cvd.LOAI_CONG_VAN)
                                       AND (
                                                   donViNhan IS NULL OR EXISTS(
                                                   SELECT dvn.ID
                                                   FROM HCTH_DON_VI_NHAN dvn
                                                   WHERE dvn.MA = cvd.ID
                                                     AND dvn.DON_VI_NHAN_NGOAI = 0
                                                     AND dvn.LOAI = 'DI'
                                                     AND dvn.DON_VI_NHAN = donViNhan
                                               ))
                                       AND (
                                                   donViNhanNgoai IS NULL OR EXISTS(
                                                   SELECT dvn.ID
                                                   FROM HCTH_DON_VI_NHAN dvn
                                                   WHERE dvn.MA = cvd.ID
                                                     AND dvn.DON_VI_NHAN_NGOAI = 1
                                                     AND dvn.LOAI = 'DI'
                                                     AND dvn.DON_VI_NHAN = donViNhanNgoai
                                               ))
                                       AND (
                                                   canBoNhan IS NULL OR EXISTS(
                                                   SELECT cbn.ID
                                                   FROM HCTH_CAN_BO_NHAN cbn
                                                   WHERE cbn.MA = cvd.ID
                                                     AND cbn.LOAI = 'DI'
                                                     AND cbn.CAN_BO_NHAN = canBoNhan
                                               )
                                           )
                                       AND (status IS NULL OR status = cvd.TRANG_THAI)
                                       and (
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
                                                                                           AND cvd.NGAY_GUI IS NOT NULL
                                                                                           AND cvd.NGAY_GUI >= fromTime
                                                                                       )
                                                                                   OR (
                                                                                               timeType = 2
                                                                                           AND cvd.NGAY_KY IS NOT NULL
                                                                                           AND cvd.NGAY_KY >= fromTime
                                                                                       )
                                                                               )
                                                                   )
                                                           AND (
                                                                           toTime IS NULL
                                                                       OR (
                                                                                   (
                                                                                               timeType = 1
                                                                                           AND cvd.NGAY_GUI IS NOT NULL
                                                                                           AND cvd.NGAY_GUI <= toTime
                                                                                       )
                                                                                   OR (
                                                                                               timeType = 2
                                                                                           AND cvd.NGAY_KY IS NOT NULL
                                                                                           AND cvd.NGAY_KY <= toTime
                                                                                       )
                                                                               )
                                                                   )
                                                       )
                                           )
                                       AND (
                                                   ST = ''
                                               OR LOWER(cvd.TRICH_YEU) LIKE ST
                                               OR LOWER(cvd.SO_CONG_VAN) LIKE ST
                                           )
                                   )
                           )
                 ORDER BY cvd.ID DESC
             );

    RETURN CVD_INFO;
END;

/
--EndMethod--

DROP FUNCTION HCTH_CONG_VAN_DI_GET_ALL_STAFF;
/
--EndMethod--

CREATE OR REPLACE function HCTH_CONG_VAN_DI_SEARCH_SELECTOR(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    scope IN STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor       SYS_REFCURSOR;
    sT              STRING(500) := '%' || lower(searchTerm) || '%';
    userDepartments NVARCHAR2(100);
    userShcc        NVARCHAR2(10);
    fromTime        NUMBER(20);
    toTime          NUMBER(20);
--     staffType       NUMBER(4);
    ids             NVARCHAR2(64);
    hasIds          NUMBER(1);
    excludeIds      STRING(64);
    departmentScope NVARCHAR2(512);
    globalScope     NVARCHAR2(512);

BEGIN

    SELECT JSON_VALUE(filterParam, '$.userDepartments') INTO userDepartments FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.userShcc') INTO userShcc FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.toTime') INTO toTime FROM DUAL;
--     SELECT JSON_VALUE(filterParam, '$.staffType') INTO staffType FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.ids') INTO ids FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.excludeIds') INTO excludeIds FROM DUAL;
    SELECT JSON_VALUE(filterParam, '$.hasIds') INTO hasIds FROM DUAL;

    SELECT JSON_VALUE(scope, '$.DEPARTMENT') INTO departmentScope FROM DUAL;
    SELECT JSON_VALUE(scope, '$.GLOBAL') INTO globalScope FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthcvd
    WHERE
      -- permisssion check
        (
                (userShcc is not null and (hcthcvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                  from HCTH_CAN_BO_NHAN cbn
                                                                                  where cbn.ma = hcthcvd.ID
                                                                                    and cbn.LOAI = 'DI'
                                                                                    and hcthcvd.TRANG_THAI = 'DA_PHAT_HANH')))
                or
                (departmentScope is not null and userDepartments is not null and hcthcvd.DON_VI_GUI is not null and
                 hcthcvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                 hcthcvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                        from dual
                                        connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                or
                (globalScope is not null and hcthcvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                                    from dual
                                                                    connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
            ) --filter
      and (fromTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO > fromTime))
      AND (toTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO < toTime))
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
                     hcthcvd.SO_CONG_VAN   AS                     "soCongVan",
                     hcthcvd.LOAI_CONG_VAN AS                     "loai",
                     hcthcvd.DON_VI_GUI    AS                     "maDonViGui",
                     dvg.TEN               AS                     "tenDonViGui",
                     hcthcvd.TRICH_YEU     AS                     "trichYeu",
                     hcthcvd.TRANG_THAI    AS                     "trangThai",
                     hcthcvd.NGAY_TAO      AS                     "ngayTao",

                     ROW_NUMBER() OVER (ORDER BY hcthcvd.ID DESC) R
              FROM HCTH_CONG_VAN_DI hcthcvd
                       LEFT JOIN DM_DON_VI dvg on hcthcvd.DON_VI_GUI = dvg.MA
              WHERE
                -- permisssion check
                  (
                          (userShcc is not null and (hcthcvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                            from HCTH_CAN_BO_NHAN cbn
                                                                                            where cbn.ma = hcthcvd.ID
                                                                                              and cbn.LOAI = 'DI'
                                                                                              and hcthcvd.TRANG_THAI = 'DA_PHAT_HANH')))
                          or
                          (departmentScope is not null and userDepartments is not null and
                           hcthcvd.DON_VI_GUI is not null and
                           hcthcvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                           hcthcvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                          or
                          (globalScope is not null and
                           hcthcvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
                      ) --filter
                and (fromTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO > fromTime))
                AND (toTime is null or (hcthcvd.NGAY_TAO is not null and hcthcvd.NGAY_TAO < toTime))
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

CREATE OR REPLACE procedure hcth_cong_van_di_update_so_cong_van(
    ma in number,
    donViGui in NUMBER,
    nam in NUMBER
)
    IS
    maxThuTu           number;
    tenVietTatDonViGui STRING(100);
    loaiVanBan         STRING(10);
    loaiCongVan        STRING(20);
    postfix            STRING(200);
    counter            NUMBER(10);
    counter2           NUMBER(10);
    isExists           NUMBER(10);
    isExists2          NUMBER(10);
    laySoTuDong        NUMBER(1);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_cong_van_di';
    SELECT dvg.TEN_VIET_TAT
    into tenVietTatDonViGui
    FROM DM_DON_VI dvg
    WHERE dvg.MA = donViGui;

    SELECT lcv.TEN_VIET_TAT
    into loaiVanBan
    FROM HCTH_CONG_VAN_DI hcthCVD
             LEFT JOIN DM_LOAI_CONG_VAN lcv ON lcv.ID = hcthCVD.LOAI_VAN_BAN
    WHERE hcthCVD.ID = ma;

    select LAY_SO_TU_DONG into laySoTuDong from HCTH_CONG_VAN_DI where id = ma;

    if laySoTuDong = 1 then
        begin
            SELECT hcthCVD.LOAI_CONG_VAN into loaiCongVan from HCTH_CONG_VAN_DI hcthCVD WHERE hcthCVD.ID = ma;

            select MAX(SO_DI)
            into maxThuTu
            from HCTH_CONG_VAN_DI
            WHERE donViGui = DON_VI_GUI
              and (NGAY_TAO > nam)
              AND LOAI_CONG_VAN = loaiCongVan;
        exception
            when NO_DATA_FOUND then
                maxThuTu := 0;
        end;

        if maxThuTu is null then
            maxThuTu := 0;
        end if;
        maxThuTu := maxThuTu + 1;

        postfix := '/';
        IF loaiVanBan IS NOT NULL THEN
            postfix := postfix || loaiVanBan || '-';
        end if;

        postfix := postfix || 'XHNV';
        IF tenVietTatDonViGui IS NOT NULL THEN
            postfix := postfix || '-' || tenVietTatDonViGui;
        end if;


        counter := 2000;
        select count(*)
        into isExists
        from HCTH_CONG_VAN_DI
        WHERE donViGui = DON_VI_GUI
          and (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = loaiCongVan
          AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
        WHILE isExists > 0
            LOOP
                if counter = 0 then
                    RAISE invalid_number;
                end if;
                maxThuTu := maxThuTu + 1;
                counter := counter - 1;
                select count(*)
                into isExists
                from HCTH_CONG_VAN_DI
                WHERE donViGui = DON_VI_GUI
                  and (NGAY_TAO > nam)
                  AND LOAI_CONG_VAN = loaiCongVan
                  AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
            END LOOP;

        counter2 := 2000;
        SELECT COUNT(*)
        INTO isExists2
        FROM HCTH_SO_DANG_KY
        WHERE donViGui = DON_VI_GUI
          AND (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = loaiCongVan
          AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
        WHILE isExists2 > 0
            LOOP
                if counter2 = 0 THEN
                    RAISE INVALID_NUMBER;
                end if;
                maxThuTu := maxThuTu + 1;
                counter2 := counter2 - 1;
                SELECT COUNT(*)
                INTO isExists2
                FROM HCTH_SO_DANG_KY
                WHERE donViGui = DON_VI_GUI
                  AND (NGAY_TAO > nam)
                  AND LOAI_CONG_VAN = loaiCongVan
                  AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
            end loop;

        update HCTH_CONG_VAN_DI hcthCVD
        set hcthCVD.SO_DI                   = maxThuTu,
            hcthCVD.TEN_VIET_TAT_DON_VI_GUI = tenVietTatDonViGui,
            hcthCVD.SO_CONG_VAN             = TO_CHAR(maxThuTu) || postfix
        WHERE hcthCVD.ID = ma;
    end if;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_GET_ALL_FROM(
    congVanId in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcvtk.ID         as "id",
               hcthcvtk.NGUOI_TAO  as "nguoiTao",
               hcthcvtk.THOI_GIAN  as "thoiGian",
               hcthcvtk.FILE_CONG_VAN as "fileCongVan",
               cbk.HO as "hoNguoiTao",
               cbk.TEN as "tenNguoiTao",
               hcthFile.TEN as "ten",
               hcthFile.TEN_FILE as "tenGoc",
                (SELECT LISTAGG(
                    CASE
                        WHEN cbk.HO IS NULL THEN cbk.TEN
                        WHEN cbk.TEN IS NULL THEN cbk.HO
                        ELSE CONCAT(CONCAT(cbk.HO, ' '), cbk.TEN)
                    END, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                            LEFT JOIN TCHC_CAN_BO cbk ON cbk.SHCC = hcthcbk.NGUOI_KY
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachTenCanBoKy",
                (SELECT LISTAGG(hcthcbk.NGUOI_KY, ',') WITHIN GROUP (
                             order by hcthcbk.ID
                             )
                      FROM HCTH_CAN_BO_KY hcthcbk
                      WHERE hcthcbk.CONG_VAN_TRINH_KY = hcthcvtk.ID
                    )
                     AS "danhSachShccCanBoKy"
--                  LISTAGG(last_name, '; ') WITHIN GROUP (ORDER BY hire_date, last_name)
--
        from HCTH_CONG_VAN_TRINH_KY hcthcvtk
            LEFT JOIN HCTH_FILE hcthFile on hcthcvtk.FILE_CONG_VAN = hcthFile.ID
            LEFT JOIN TCHC_CAN_BO cbk on hcthcvtk.NGUOI_TAO = cbk.SHCC
        where (hcthcvtk.CONG_VAN = congVanId)
        order by hcthcvtk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_PHAN_HOI_GET_ALL_FROM(
    target IN NUMBER,
    targetType in STRING
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT ph.ID         as "id",
               ph.NOI_DUNG   as "noiDung",
               ph.CAN_BO_GUI as "canBoGui",
               ph.NGAY_TAO   as "ngayTao",
               cb.HO         as "ho",
               cb.TEN        as "ten",
               DMCV.TEN      as "chucVu",
               usr.IMAGE     AS "image",
               fi.ID         AS "fileId",
               fi.TEN        AS "tenFile"


        FROM HCTH_PHAN_HOI ph
                 LEFT JOIN TCHC_CAN_BO cb on ph.CAN_BO_GUI = cb.SHCC
                 LEFT JOIN QT_CHUC_VU qtcv ON cb.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN FW_USER usr on usr.SHCC = cb.shcc
                 LEFT JOIN HCTH_FILE fi on (fi.LOAI = 'PHAN_HOI') and fi.MA = ph.ID


        WHERE (target is not null and ph.KEY = target and ph.loai is not null and (targetType = ph.loai))
        ORDER BY NGAY_TAO;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE HCTH_SO_DANG_KY_CREATE_SO_VAN_BAN(
    donViGui IN NUMBER,
    capVanBan IN STRING,
    loaiVanBan IN NUMBER,
    nam IN NUMBER,
    tuDong IN NUMBER,
    ngayTao IN NUMBER
)
    IS
    maxThuTu             NUMBER;
    tenVietTatDonViGui   STRING(100);
    tenVietTatLoaiVanBan STRING(10);
    postfix              STRING(200);
    counter              NUMBER(10);
    counter2             NUMBER(10);
    isExists             NUMBER(10);
    isExists2            NUMBER(10);

BEGIN
    commit;
    set transaction isolation level SERIALIZABLE name 'update_so_van_ban';
    SELECT dvg.TEN_VIET_TAT
    INTO tenVietTatDonViGui
    FROM DM_DON_VI dvg
    WHERE dvg.MA = donViGui;

    if loaiVanBan != 0 then
        SELECT lcv.TEN_VIET_TAT
        INTO tenVietTatLoaiVanBan
        FROM DM_LOAI_CONG_VAN lcv
        WHERE (loaiVanBan != 0)
          AND (loaiVanBan = lcv.ID);
    end if;


    if tuDong = 1 then
        BEGIN
            SELECT MAX(SO_DI)
            INTO maxThuTu
            FROM HCTH_SO_DANG_KY
            WHERE donViGui = DON_VI_GUI
              AND (NGAY_TAO > nam)
              AND LOAI_CONG_VAN = capVanBan;
        exception
            when NO_DATA_FOUND then
                maxThuTu := 0;
        end;

        if maxThuTu is null then
            maxThuTu := 0;
        end if;
        maxThuTu := maxThuTu + 1;

        postfix := '/';
        IF tenVietTatLoaiVanBan IS NOT NULL THEN
            postfix := postfix || tenVietTatLoaiVanBan || '-';
        end if;

        postfix := postfix || 'XHNV';
        IF tenVietTatDonViGui IS NOT NULL THEN
            postfix := postfix || '-' || tenVietTatDonViGui;
        end if;

        counter := 2000;
        counter2 := 2000;
        SELECT COUNT(*)
        INTO isExists
        FROM HCTH_SO_DANG_KY
        WHERE donViGui = DON_VI_GUI
          AND (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = capVanBan
          AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
        WHILE isExists > 0
            LOOP
                if counter = 0 then
                    RAISE INVALID_NUMBER;
                end if;
                maxThuTu := maxThuTu + 1;
                counter := counter - 1;
                SELECT COUNT(*)
                INTO isExists
                FROM HCTH_SO_DANG_KY
                WHERE donViGui = DON_VI_GUI
                  AND (NGAY_TAO > nam)
                  AND LOAI_CONG_VAN = capVanBan
                  AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
            end loop;

        SELECT COUNT(*)
        INTO isExists2
        FROM HCTH_CONG_VAN_DI
        WHERE donViGui = DON_VI_GUI
          AND (NGAY_TAO > nam)
          AND LOAI_CONG_VAN = capVanBan
          AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
        WHILE isExists2 > 0
            LOOP
                if counter2 = 0 THEN
                    RAISE INVALID_NUMBER;
                end if;
                maxThuTu := maxThuTu + 1;
                counter2 := counter2 - 1;
                SELECT COUNT(*)
                INTO isExists2
                FROM HCTH_CONG_VAN_DI
                WHERE donViGui = DON_VI_GUI
                  AND (NGAY_TAO > nam)
                  AND LOAI_CONG_VAN = capVanBan
                  AND SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix;
            end loop;

        INSERT INTO HCTH_SO_DANG_KY
        (SO_CONG_VAN, SO_DI, LOAI_CONG_VAN, LOAI_VAN_BAN, DON_VI_GUI, NGAY_TAO, TU_DONG, SU_DUNG)
        values (TO_CHAR(maxThuTu) || postfix, maxThuTu, capVanBan, loaiVanBan, donViGui, ngayTao, tuDong, 0);


    end if;
    commit;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_SO_DANG_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    tabValue IN NUMBER,
    filter IN STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor       SYS_REFCURSOR;
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
    donViGui        NUMBER(20);
    loaiCongVan     NVARCHAR2(20);
    loaiVanBan      NVARCHAR2(100);
    maCongVan       NUMBER(20);
    isSelector      NUMBER(1);
    userDepartments NVARCHAR2(100);

BEGIN
    SELECT JSON_VALUE(filter, '$.userDepartments') INTO userDepartments FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViGui') INTO donViGui FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiCongVan') INTO loaiCongVan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiVanBan') INTO loaiVanBan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.maCongVan') INTO maCongVan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isSelector') INTO isSelector FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_SO_DANG_KY dks
    WHERE (
                  (
                              ST = ''
                          OR LOWER(dks.SO_CONG_VAN) LIKE ST
                      )
                  AND (
                          (tabValue = 0)
                          OR (tabValue = 1 AND dks.TU_DONG = 1)
                          OR (tabValue = 2 AND dks.TU_DONG = 0)
                      )
                  AND (
                          (donViGui IS NULL OR donViGui = dks.DON_VI_GUI)
                          AND (loaiCongVan IS NULL OR loaiCongVan = dks.LOAI_CONG_VAN)
                          AND (loaiVanBan IS NULL OR loaiVanBan = dks.LOAI_VAN_BAN)
                      )
                  AND (
                              isSelector IS NULL OR
                              (
                                      (loaiVanBan IS NULL AND dks.LOAI_VAN_BAN IS NULL)
                                      OR (loaiVanBan = dks.LOAI_VAN_BAN)
                                  )
                      )
                  AND (
                              dks.SU_DUNG = 0
                          OR (
                                          dks.SU_DUNG = 1
                                      AND maCongVan = dks.MA
                                  )
                      )
                  AND (
                              userDepartments IS NOT NULL AND dks.DON_VI_GUI IS NOT NULL AND
                              dks.DON_VI_GUI IN (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL)
                      )
              );

    IF pageNumber < 1 THEN
        pageNumber := 1;
    end if;

    IF pageSize < 1 THEN
        pageSize := 1;
    end if;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT dks.ID            AS                     "id",
                     dks.SO_CONG_VAN   AS                     "soCongVan",
                     dks.NGAY_TAO      AS                     "ngayTao",
                     dvg.TEN           AS                     "tenDonViGui",
                     lcv.TEN           AS                     "tenLoaiVanBan",
                     dks.LOAI_CONG_VAN AS                     "capVanBan",
                     ROW_NUMBER() over (ORDER BY dks.ID DESC) R

              FROM HCTH_SO_DANG_KY dks
                       LEFT JOIN DM_DON_VI dvg ON dvg.MA = dks.DON_VI_GUI
                       LEFT JOIN DM_LOAI_CONG_VAN lcv ON lcv.ID = dks.LOAI_VAN_BAN
              WHERE (
                            (
                                        ST = ''
                                    OR LOWER(dks.SO_CONG_VAN) LIKE ST
                                )
                            AND (
                                    (tabValue = 0)
                                    OR (tabValue = 1 AND dks.TU_DONG = 1)
                                    OR (tabValue = 2 AND dks.TU_DONG = 0)
                                )
                            AND (
                                    (donViGui IS NULL OR donViGui = dks.DON_VI_GUI)
                                    AND (loaiCongVan IS NULL OR loaiCongVan = dks.LOAI_CONG_VAN)
                                    AND (loaiVanBan IS NULL OR loaiVanBan = dks.LOAI_VAN_BAN)
                                )
                            AND (
                                        isSelector IS NULL OR
                                        (
                                                (loaiVanBan IS NULL AND dks.LOAI_VAN_BAN IS NULL)
                                                OR (loaiVanBan = dks.LOAI_VAN_BAN)
                                            )
                                )
                            AND (
                                        dks.SU_DUNG = 0
                                    OR (
                                                    dks.SU_DUNG = 1
                                                AND maCongVan = dks.MA
                                            )
                                )
                            AND (
                                        userDepartments IS NOT NULL AND dks.DON_VI_GUI IS NOT NULL AND
                                        dks.DON_VI_GUI IN (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL)
                                )
                        )
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;

    RETURN my_cursor;
end;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE HCTH_SO_DANG_KY_VALIDATE_SO_CONG_VAN(
    soDangKy IN STRING,
    capVanBan IN STRING,
    donViGui IN NUMBER,
    nam IN NUMBER
--     ngayTao IN NUMBER
)
AS
    counter  NUMBER(10);
    counter2 NUMBER(10);
BEGIN
    commit;
    set transaction isolation level SERIALIZABLE NAME 'HCTH_DANG_KY_SO_VALIDATE_SO_CONG_VAN';
    BEGIN
        SELECT COUNT(*)
        INTO counter
        FROM HCTH_SO_DANG_KY dks
        WHERE dks.SO_CONG_VAN = soDangKy
          AND dks.DON_VI_GUI = donViGui
          AND dks.NGAY_TAO > nam
          AND dks.LOAI_CONG_VAN = capVanBan;

        SELECT COUNT(*)
        INTO counter2
        FROM HCTH_CONG_VAN_DI cvd
        WHERE cvd.SO_CONG_VAN = soDangKy
        AND cvd.DON_VI_GUI = donViGui
        AND cvd.NGAY_TAO > nam
        AND cvd.LOAI_CONG_VAN = capVanBan;

        if counter > 0 then
            RAISE INVALID_NUMBER;
        ELSIF counter2 > 0 then
            RAISE INVALID_NUMBER;
            --         ELSE
--             INSERT INTO HCTH_DANG_KY_SO
--             (SO_CONG_VAN, LOAI_CONG_VAN, DON_VI_GUI, NGAY_TAO, TU_DONG)
--             VALUES
--             (soDangKy, capVanBan, donViGui, ngayTao, 0);
        end if;
    end;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_GET_MANAGE_STAFF(
--     congVanId IN NUMBER,
-- lay ra email cua truong don vi hoac cua chuyen vien quan ly cong van di
    donVi IN NUMBER,
    nguoiTao IN STRING,
    role IN STRING
) RETURN SYS_REFCURSOR
AS
    CVD_INFO SYS_REFCURSOR;
BEGIN
    OPEN CVD_INFO FOR
        SELECT UNIQUE cb.email as "email"
        FROM TCHC_CAN_BO cb
                 LEFT JOIN QT_CHUC_VU qtcv
                           ON qtcv.SHCC = cb.SHCC AND qtcv.CHUC_VU_CHINH = 1 AND qtcv.MA_DON_VI = donVi AND
                              qtcv.THOI_CHUC_VU = 0
        WHERE qtcv.MA_DON_VI = donVi
          AND cb.SHCC != nguoiTao
          AND (
                (qtcv.MA_CHUC_VU IN ('003', '005', '007', '009', '011', '013')
                    )
                OR (
                        cb.SHCC IN (
                        SELECT UNIQUE fw.NGUOI_DUOC_GAN
                        FROM FW_ASSIGN_ROLE fw
                        WHERE fw.TEN_ROLE = role
                    )
                    ));
    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE_ALTERNATE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    searchTerm IN STRING,
    scope in STRING,
    filter in String,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER) RETURN SYS_REFCURSOR AS
    userShcc        NVARCHAR2(10);
    donViGui        NUMBER(20);
    donViNhan       NUMBER(20);
    loaiCongVan     NVARCHAR2(20);
    loaiVanBan      NVARCHAR2(100);
    donViNhanNgoai  NUMBER(20);
    canBoNhan       NVARCHAR2(10);
    status          NVARCHAR2(100);
    timeType        NUMBER(20);
    fromTime        NUMBER(20);
    toTime          NUMBER(20);
    CVD_INFO        SYS_REFCURSOR;
    departmentScope NVARCHAR2(512);
    globalScope     NVARCHAR2(512);
    userDepartments NVARCHAR2(100);
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT JSON_VALUE(scope, '$.DEPARTMENT') INTO departmentScope FROM DUAL;
    SELECT JSON_VALUE(scope, '$.GLOBAL') INTO globalScope FROM DUAL;


    SELECT JSON_VALUE(filter, '$.userDepartments') INTO userDepartments FROM DUAL;
    SELECT JSON_VALUE(filter, '$.userShcc') INTO userShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViGui') INTO donViGui FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViNhan') INTO donViNhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.donViNhanNgoai') INTO donViNhanNgoai FROM DUAL;
    SELECT JSON_VALUE(filter, '$.canBoNhan') INTO canBoNhan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiCongVan') INTO loaiCongVan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiVanBan') INTO loaiVanBan FROM DUAL;
    SELECT JSON_VALUE(filter, '$.status') INTO status FROM DUAL;
    SELECT JSON_VALUE(filter, '$.timeType') INTO timeType FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromTime') INTO fromTime FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toTime') INTO toTime FROM DUAL;


    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI cvd
             LEFT JOIN DM_DON_VI dvg on (cvd.DON_VI_GUI = dvg.MA)
    WHERE (
--         check permission

                  ((userShcc is not null and (cvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                 from HCTH_CAN_BO_NHAN cbn
                                                                                 where cbn.ma = cvd.ID
                                                                                   and cbn.LOAI = 'DI'
                                                                                   and cvd.TRANG_THAI = 'DA_PHAT_HANH')))
                      or
                   (departmentScope is not null and userDepartments is not null and cvd.DON_VI_GUI is not null and
                    cvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                    cvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                       from dual
                                       connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                      or
                   (globalScope is not null and cvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
                      )
                  AND (
                          (donViGui IS NULL OR donViGui = cvd.DON_VI_GUI)
                          AND (loaiVanBan IS NULL OR loaiVanBan = cvd.LOAI_VAN_BAN)
                          AND (loaiCongVan IS NULL OR loaiCongVan = cvd.LOAI_CONG_VAN)
                          AND (
                                      donViNhan IS NULL OR EXISTS(
                                      SELECT dvn.ID
                                      FROM HCTH_DON_VI_NHAN dvn
                                      WHERE dvn.MA = cvd.ID
                                        AND dvn.DON_VI_NHAN_NGOAI = 0
                                        AND dvn.LOAI = 'DI'
                                        AND dvn.DON_VI_NHAN = donViNhan
                                  ))
                          AND (
                                      donViNhanNgoai IS NULL OR EXISTS(
                                      SELECT dvn.ID
                                      FROM HCTH_DON_VI_NHAN dvn
                                      WHERE dvn.MA = cvd.ID
                                        AND dvn.DON_VI_NHAN_NGOAI = 1
                                        AND dvn.LOAI = 'DI'
                                        AND dvn.DON_VI_NHAN = donViNhanNgoai
                                  ))
                          AND (
                                      canBoNhan IS NULL OR EXISTS(
                                      SELECT cbn.ID
                                      FROM HCTH_CAN_BO_NHAN cbn
                                      WHERE cbn.MA = cvd.ID
                                        AND cbn.LOAI = 'DI'
                                        AND cbn.CAN_BO_NHAN = canBoNhan
                                  )
                              )
                          AND (status IS NULL OR status = cvd.TRANG_THAI)
                          and (
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
                                                                              AND cvd.NGAY_GUI IS NOT NULL
                                                                              AND cvd.NGAY_GUI >= fromTime
                                                                          )
                                                                      OR (
                                                                                  timeType = 2
                                                                              AND cvd.NGAY_KY IS NOT NULL
                                                                              AND cvd.NGAY_KY >= fromTime
                                                                          )
                                                                  )
                                                      )
                                              AND (
                                                              toTime IS NULL
                                                          OR (
                                                                      (
                                                                                  timeType = 1
                                                                              AND cvd.NGAY_GUI IS NOT NULL
                                                                              AND cvd.NGAY_GUI <= toTime
                                                                          )
                                                                      OR (
                                                                                  timeType = 2
                                                                              AND cvd.NGAY_KY IS NOT NULL
                                                                              AND cvd.NGAY_KY <= toTime
                                                                          )
                                                                  )
                                                      )
                                          )
                              )
                          AND (
                                      ST = ''
                                  OR LOWER(cvd.TRICH_YEU) LIKE ST
                                  OR LOWER(cvd.SO_CONG_VAN) LIKE ST
                              )
                      )
              );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR SELECT *
                      FROM (SELECT cvd.ID                                AS "id",
                                   cvd.TRICH_YEU                         AS "trichYeu",
                                   cvd.NGAY_GUI                          AS "ngayGui",
                                   cvd.NGAY_KY                           AS "ngayKy",
                                   cvd.CAN_BO_NHAN                       AS "maCanBoNhan",
                                   cvd.TRANG_THAI                        AS "trangThai",
                                   cvd.LOAI_CONG_VAN                     AS "loaiCongVan",
                                   cvd.SO_CONG_VAN                       AS "soCongVan",
                                   cvd.LOAI_VAN_BAN                      AS "loaiVanBan",
                                   cvd.NGAY_TAO                          AS "ngayTao",
                                   dvg.MA                                AS "maDonViGui",
                                   dvg.TEN                               AS "tenDonViGui",
                                   lvb.TEN                               AS "tenLoaiVanBan",
                                   cvd.IS_PHYSICAL                       AS "isPhysical",

                                   (SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP ( ORDER BY hcthDVN.ID )
                                    FROM HCTH_DON_VI_NHAN hcthDVN
                                    WHERE hcthDVN.MA = cvd.ID
                                      AND hcthDVN.LOAI = 'DI'
                                      AND hcthDVN.DON_VI_NHAN_NGOAI = 0) AS "maDonViNhan",
                                   (SELECT LISTAGG(hcthDVN.DON_VI_NHAN, ',') WITHIN GROUP ( ORDER BY hcthDVN.ID )
                                    FROM HCTH_DON_VI_NHAN hcthDVN
                                    WHERE hcthDVN.MA = cvd.ID
                                      AND hcthDVN.LOAI = 'DI'
                                      AND hcthDVN.DON_VI_NHAN_NGOAI = 1) AS "donViNhanNgoai",

                                   (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP ( ORDER BY dvn.TEN )
                                    FROM DM_DON_VI dvn
                                             LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvn.MA = hcthDVN.DON_VI_NHAN
                                    WHERE hcthDVN.MA = cvd.ID
                                      AND hcthDVN.LOAI = 'DI'
                                      AND hcthDVN.DON_VI_NHAN_NGOAI = 0) AS "danhSachDonViNhan",

                                   (SELECT LISTAGG(dvgcv.TEN, '; ') WITHIN GROUP ( ORDER BY dvgcv.TEN )
                                    FROM DM_DON_VI_GUI_CV dvgcv
                                             LEFT JOIN HCTH_DON_VI_NHAN hcthDVN ON dvgcv.ID = hcthDVN.DON_VI_NHAN
                                    WHERE hcthDVN.MA = cvd.ID
                                      AND hcthDVN.LOAI = 'DI'
                                      AND hcthDVN.DON_VI_NHAN_NGOAI = 1) AS "danhSachDonViNhanNgoai",

                                   (SELECT LISTAGG(CASE
                                                       WHEN cbn.HO IS NULL
                                                           THEN cbn.TEN
                                                       WHEN cbn.TEN IS NULL
                                                           THEN cbn.HO
                                                       WHEN DMCV.TEN IS NULL
                                                           THEN CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                                                       ELSE CONCAT(
                                                               CONCAT(CONCAT(DMCV.TEN, ' - '), CONCAT(cbn.HO, ' ')),
                                                               cbn.TEN) END,
                                                   '; ')
                                                   WITHIN GROUP ( order by cbn.TEN ) as hoVaTenCanBo
                                    FROM HCTH_CAN_BO_NHAN cb
                                             LEFT JOIN TCHC_CAN_BO cbn ON cb.CAN_BO_NHAN = cbn.SHCC
                                             LEFT JOIN QT_CHUC_VU qtcv ON cbn.SHCC = qtcv.SHCC AND CHUC_VU_CHINH = 1
                                             LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = qtcv.MA_CHUC_VU
                                    WHERE cb.MA = cvd.ID
                                      AND cb.LOAI = 'DI'
                                   )
                                                                         AS "danhSachCanBoNhan",

                                   ROW_NUMBER() OVER (ORDER BY cvd.ID DESC) R
                            FROM HCTH_CONG_VAN_DI cvd
                                     LEFT JOIN DM_DON_VI dvg on (cvd.DON_VI_GUI = dvg.MA)
                                     LEFT JOIN DM_LOAI_CONG_VAN lvb
                                               on cvd.LOAI_VAN_BAN is not null and lvb.ID = cvd.LOAI_VAN_BAN
                            WHERE (((userShcc is not null and (cvd.NGUOI_TAO = userShcc or EXISTS(SELECT cbn.ID
                                                                                                  from HCTH_CAN_BO_NHAN cbn
                                                                                                  where cbn.ma = cvd.ID
                                                                                                    and cbn.LOAI = 'DI'
                                                                                                    and cvd.TRANG_THAI = 'DA_PHAT_HANH')))
                                or
                                    (departmentScope is not null and userDepartments is not null and
                                     cvd.DON_VI_GUI in (SELECT regexp_substr(userDepartments, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(userDepartments, '[^,]+', 1, level) is NOT NULL) and
                                     cvd.TRANG_THAI in (SELECT regexp_substr(departmentScope, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(departmentScope, '[^,]+', 1, level) is NOT NULL))
                                or
                                    (globalScope is not null and
                                     cvd.TRANG_THAI in (SELECT regexp_substr(globalScope, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(globalScope, '[^,]+', 1, level) is NOT NULL))
                                       )
                                and (
                                           (donViGui IS NULL OR donViGui = cvd.DON_VI_GUI)
                                           AND (loaiVanBan IS NULL OR loaiVanBan = cvd.LOAI_VAN_BAN)
                                           AND (loaiCongVan IS NULL OR loaiCongVan = cvd.LOAI_CONG_VAN)
                                           AND (
                                                       donViNhan IS NULL OR EXISTS(
                                                       SELECT dvn.ID
                                                       FROM HCTH_DON_VI_NHAN dvn
                                                       WHERE dvn.MA = cvd.ID
                                                         AND dvn.DON_VI_NHAN_NGOAI = 0
                                                         AND dvn.LOAI = 'DI'
                                                         AND dvn.DON_VI_NHAN = donViNhan
                                                   ))
                                           AND (
                                                       donViNhanNgoai IS NULL OR EXISTS(
                                                       SELECT dvn.ID
                                                       FROM HCTH_DON_VI_NHAN dvn
                                                       WHERE dvn.MA = cvd.ID
                                                         AND dvn.DON_VI_NHAN_NGOAI = 1
                                                         AND dvn.LOAI = 'DI'
                                                         AND dvn.DON_VI_NHAN = donViNhanNgoai
                                                   ))
                                           AND (
                                                       canBoNhan IS NULL OR EXISTS(
                                                       SELECT cbn.ID
                                                       FROM HCTH_CAN_BO_NHAN cbn
                                                       WHERE cbn.MA = cvd.ID
                                                         AND cbn.LOAI = 'DI'
                                                         AND cbn.CAN_BO_NHAN = canBoNhan
                                                   )
                                               )
                                           AND (status IS NULL OR status = cvd.TRANG_THAI)
                                           and (
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
                                                                                               AND
                                                                                                   cvd.NGAY_GUI IS NOT NULL
                                                                                               AND cvd.NGAY_GUI >=
                                                                                                   fromTime
                                                                                           )
                                                                                       OR (
                                                                                                   timeType = 2
                                                                                               AND
                                                                                                   cvd.NGAY_KY IS NOT NULL
                                                                                               AND cvd.NGAY_KY >=
                                                                                                   fromTime
                                                                                           )
                                                                                   )
                                                                       )
                                                               AND (
                                                                               toTime IS NULL
                                                                           OR (
                                                                                       (
                                                                                                   timeType = 1
                                                                                               AND
                                                                                                   cvd.NGAY_GUI IS NOT NULL
                                                                                               AND cvd.NGAY_GUI <=
                                                                                                   toTime
                                                                                           )
                                                                                       OR (
                                                                                                   timeType = 2
                                                                                               AND
                                                                                                   cvd.NGAY_KY IS NOT NULL
                                                                                               AND cvd.NGAY_KY <= toTime
                                                                                           )
                                                                                   )
                                                                       )
                                                           )
                                               )
                                           AND (
                                                       ST = ''
                                                   OR LOWER(cvd.TRICH_YEU) LIKE ST
                                                   OR LOWER(cvd.SO_CONG_VAN) LIKE ST
                                               )
                                       )
                                      )
                            ORDER BY R)
                      WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_SIGNING_CONFIG_GET_LIST(
    vbdfId IN NUMBER -- van ban di file id
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN

    OPEN my_cursor FOR
        SELECT distinct sconfig.ID as "id",
                        sconfig.SHCC as "shcc",
                        sconfig.STATUS as "status",
                        sconfig.VBDF_ID as "vbdfId",
                        sconfig.X_COORDINATE as "xCoordinate",
                        sconfig.Y_COORDINATE as "yCoordinate",
                        sconfig.SIGN_TYPE as "signType",
                        sconfig.PAGE_NUMBER as "pageNumber",
                        sconfig.FONT_NAME as "fontName",
                        sconfig.FONT_SIZE as "fontSize",
                        sconfig.SIGN_AT as "signAt",
                        cb.HO        as "hoNguoiTao",
                        cb.TEN       as "tenNguoiTao"


        FROM HCTH_SIGNING_CONFIG sconfig
                 LEFT JOIN TCHC_CAN_BO cb on sconfig.SHCC = cb.SHCC
        WHERE sconfig.VBDF_ID = vbdfId
        ORDER BY sconfig.ID ;
    RETURN my_cursor;
END;

/
--EndMethod--