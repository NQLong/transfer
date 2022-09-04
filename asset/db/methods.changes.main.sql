CREATE OR REPLACE PROCEDURE HCTH_SO_DANG_KY_CREATE_SO_VAN_BAN(
--     ma IN NUMBER,
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
--     capVanBan            STRING(10);
    tenVietTatLoaiVanBan STRING(10);
    postfix              STRING(200);
    counter              NUMBER(10);
    isExists             NUMBER(10);
--     laySoTuDong          NUMBER(1);

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

        INSERT INTO HCTH_SO_DANG_KY
        (SO_CONG_VAN, SO_DI, LOAI_CONG_VAN, LOAI_VAN_BAN, DON_VI_GUI, NGAY_TAO, TU_DONG, SU_DUNG)
        values (TO_CHAR(maxThuTu) || postfix, maxThuTu, capVanBan, loaiVanBan, donViGui, ngayTao, tuDong, 0);
        --         values dks.SO_DI  = maxThuTu,
--             dks.SO_CONG_VAN = TO_CHAR(maxThuTu) || postfix,
--             dks.LOAI_CONG_VAN = capVanBan,
--             dks.DON_VI_GUI = donViGui,
--             dks.LOAI_VAN_BAN = loaiVanBan,
--             dks.NGAY_TAO = nam
--         where dks.ID = ma;

    end if;
    commit;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_SO_DANG_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    tabValue IN NUMBER,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
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
                      dks.SU_DUNG IS NULL OR dks.SU_DUNG = 0
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
        FROM (SELECT dks.ID          AS                       "id",
                     dks.SO_CONG_VAN AS                       "soCongVan",
                     dks.NGAY_TAO    AS                       "ngayTao",
                     dvg.TEN         AS                       "tenDonViGui",

                     ROW_NUMBER() over (ORDER BY dks.ID DESC) R

              FROM HCTH_SO_DANG_KY dks
                       LEFT JOIN DM_DON_VI dvg ON dvg.MA = dks.DON_VI_GUI
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
                                dks.SU_DUNG IS NULL OR dks.SU_DUNG = 0
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
    counter NUMBER(10);
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

        if counter > 0 then
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