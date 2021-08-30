create or replace FUNCTION DM_LINH_VUC_KINH_DOANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_LINH_VUC_KINH_DOANH LV
    WHERE searchTerm = ''
       OR LOWER(TRIM(TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT LV.MA                        AS  "ma",
                    LV.TEN                          AS  "ten",
                    LV.MO_TA                        AS  "moTa",
                    LV.KICH_HOAT                    AS  "kichHoat",
                    ROW_NUMBER() OVER (ORDER BY MA DESC) R
                FROM DM_LINH_VUC_KINH_DOANH LV
                WHERE searchTerm = ''
                    OR LOWER(TRIM(TEN)) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;
