CREATE OR REPLACE FUNCTION HCTH_YEU_CAU_TAO_KHOA_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  searchTerm IN STRING, filter IN STRING,
                                                  totalItem OUT NUMBER,
                                                  pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    canBoTao  NVARCHAR2(10);
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT JSON_VALUE(filter, '$.canBoTao') INTO canBoTao FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_YEU_CAU_TAO_KHOA REQ
    WHERE (canBoTao is null or REQ.SHCC = canBoTao);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT REQ.ID            as                           "id",
                     REQ.SHCC          as                           "shcc",
                     CBT.TEN           as                           "ten",
                     CBT.HO            as                           "ho",
                     REQ.CAP_NHAT_BOI  as                           "shccCanBoCapNhat",
                     CBD.TEN           as                           "tenCanBoCapNhat",
                     CBD.HO            as                           "hoCanBoCapNhat",
                     REQ.NGAY_TAO      AS                           "ngayTao",
                     REQ.NGAY_CAP_NHAT AS                           "ngayCapNhat",
                     REQ.TRANG_THAI    AS                           "trangThai",
                     REQ.LY_DO         AS                           "lyDo",
                     ROW_NUMBER() OVER (ORDER BY REQ.NGAY_TAO DESC) R
              FROM HCTH_YEU_CAU_TAO_KHOA REQ
                       LEFT JOIN TCHC_CAN_BO CBT on REQ.SHCC = CBT.SHCC
                       LEFT JOIN TCHC_CAN_BO CBD on REQ.CAP_NHAT_BOI = CBD.SHCC
              WHERE (canBoTao is null or REQ.SHCC = canBoTao))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY R;
    RETURN my_cursor;
END ;

/
--EndMethod--

