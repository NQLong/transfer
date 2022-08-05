CREATE OR REPLACE FUNCTION DM_DON_VI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_DON_VI dv
             LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
    WHERE searchTerm = ''
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT dv.MA               AS                     "ma",
                        dv.TEN              AS                     "ten",
                        dv.TEN_TIENG_ANH    AS                     "tenTiengAnh",
                        dv.TEN_VIET_TAT     AS                     "tenVietTat",
                        dv.QD_THANH_LAP     AS                     "qdThanhLap",
                        dv.QD_XOA_TEN       AS                     "qdXoaTen",
                        dv.MA_PL            AS                     "maPl",
                        ldv.TEN             AS                     "tenLoaiDonVi",
                        dv.GHI_CHU          AS                     "ghiChu",
                        dv.KICH_HOAT        AS                     "kichHoat",
                        dv.DUONG_DAN        AS                     "duongDan",
                        dv.IMAGE            AS                     "image",
                        dv.IMAGE_DISPLAY    AS                     "imageDisplay",
                        dv.IMAGE_DISPLAY_TA AS                     "imageDisplayTa",
                        dv.PRE_SHCC         AS                     "preShcc",
                        dv.HOME_LANGUAGE    as                     "homeLanguage",
                        ROW_NUMBER() OVER (ORDER BY MA_PL, dv.TEN) R
                 FROM DM_DON_VI dv
                          LEFT JOIN DM_LOAI_DON_VI ldv on dv.MA_PL = ldv.MA
                 WHERE searchTerm = ''
                    OR LOWER(TRIM(dv.TEN)) LIKE sT
                    OR LOWER(TRIM(dv.TEN_TIENG_ANH)) LIKE ST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;

/
--EndMethod--