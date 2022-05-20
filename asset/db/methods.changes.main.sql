CREATE OR REPLACE FUNCTION TCCB_SUPPORT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    TCCB_SP    SYS_REFCURSOR;
    ST         STRING(500) := '%' || lower(searchTerm) || '%';
    TYPE_QUERY STRING(10);
    SHCC_QUERY STRING(10);
BEGIN
    SELECT JSON_VALUE(filter, '$.type') INTO TYPE_QUERY FROM DUAL;
    SELECT JSON_VALUE(filter, '$.shcc') INTO SHCC_QUERY FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCCB_SUPPORT SP
             LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
             LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

    WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC) AND
          (TYPE_QUERY IS NULL OR
           TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                  from dual
                                                  connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
      AND (searchTerm = ''
        OR LOWER(CB_YEUCAU.SHCC) LIKE ST
        OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN TCCB_SP FOR
        SELECT *
        FROM (SELECT SP.ID                                AS                    "id",
                     SP.TYPE                              AS                    "type",
                     SP.SHCC                              AS                    "shcc",
                     SP.SHCC_ASSIGN                       AS                    "shccAssign",
                     SP.DATA                              AS                    "data",
                     SP.APPROVED                          AS                    "approved",
                     SP.MODIFIED_DATE                     as                    "modifiedDate",
                     SP.QT                                as                    "qt",
                     SP.QT_ID                             AS                    "qtId",
                     SP.SENT_DATE                         AS                    "sentDate",
                     CB_XULY.HO || ' ' || CB_XULY.TEN     as                    "canBoXuLy",
                     CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN as                    "canBoYeuCau",

                     ROW_NUMBER() OVER (ORDER BY SP.SENT_DATE DESC) R
              FROM TCCB_SUPPORT SP
                       LEFT JOIN TCHC_CAN_BO CB_YEUCAU ON CB_YEUCAU.SHCC = SP.SHCC
                       LEFT JOIN TCHC_CAN_BO CB_XULY ON CB_XULY.SHCC = SP.SHCC_ASSIGN

              WHERE (SHCC_QUERY IS NULL OR SHCC_QUERY = '' OR SHCC_QUERY = CB_YEUCAU.SHCC) AND
                    (TYPE_QUERY IS NULL OR
                     TYPE_QUERY IS NOT NULL AND SP.TYPE IN (SELECT regexp_substr(TYPE_QUERY, '[^,]+', 1, level)
                                                            from dual
                                                            connect by regexp_substr(TYPE_QUERY, '[^,]+', 1, level) is not null))
                AND (searchTerm = ''
                  OR LOWER(CB_YEUCAU.SHCC) LIKE ST
                  OR LOWER(TRIM(CB_YEUCAU.HO || ' ' || CB_YEUCAU.TEN)) LIKE ST));
    RETURN TCCB_SP;

end;

/
--EndMethod--

