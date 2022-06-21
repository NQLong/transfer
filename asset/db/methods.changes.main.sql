CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_TRINH_KY_SEARCH_PAGE(
    pageNumber IN OUT NUMBER,
    pageSize IN OUT NUMBER,
    filterParam in STRING,
    searchTerm IN STRING,
    totalItem OUT NUMBER,
    pageTotal OUT NUMBER
) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN

    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_TRINH_KY cvtk
-- LEFT JOIN HCTH_CAN_BO_NHAN hcthcbn ON hcthcbn.KEY = nv.ID AND hcthcbn.LOAI = 'NHIEM_VU'
    where (1 = 1);
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
        FROM (SELECT cvtk.ID           as "id",
                     cvtk.CONG_VAN     as "congVanId",
                     cvtk.NGUOI_TAO    as "nguoiTao",
                     cvtk.THOI_GIAN    as "thoiGian",
                     cbt.HO            as "hoNguoiTao",
                     cbt.TEN           as "tenNguoiTao",
                     cvd.TRICH_YEU     as "trichYeu",
                     cvd.SO_CONG_VAN   as "soCongVan",
                     cvd.LOAI_CONG_VAN as "loaiCongVan",

                     (SELECT LISTAGG(
                                     CASE
                                         WHEN cb.HO IS NULL THEN cb.TEN
                                         WHEN cb.TEN IS NULL THEN cb.HO
                                         ELSE CONCAT(CONCAT(cb.HO, ' '), cb.TEN)
                                         END,
                                     ';'
                                 ) WITHIN GROUP (
                                         order by cb.TEN
                                         ) as "hoVaTenCanBo"
                      FROM HCTH_CAN_BO_KY cbk
                               LEFT JOIN TCHC_CAN_BO cb on cbk.NGUOI_KY = cb.SHCC
                      where cbk.CONG_VAN_TRINH_KY = cvtk.id
                     )                 as "danhSachCanBoKy",

                     ROW_NUMBER() OVER (
                         ORDER BY cvtk.ID DESC
                         )                R
              FROM HCTH_CONG_VAN_TRINH_KY cvtk
                       LEFT JOIN TCHC_CAN_BO cbt on cbt.SHCC = cvtk.NGUOI_TAO
                       LEFT JOIN HCTH_CONG_VAN_DI cvd on cvd.id = cvtk.CONG_VAN
              WHERE
-- check if user is related to congVanTrinhKy
(
    1 = 1
    ))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize
        ORDER BY 'id' DESC;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CAN_BO_KY_GET_ALL_FROM(
    congVanTrinhKy in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcbk.ID         as "id",
               hcthcbk.NGUOI_TAO  as "shccNguoiTao",
               hcthcbk.NGUOI_KY   as "nguoiKy",
               cbk.HO             as "hoCanBoNhan",
               cbk.TEN            as "tenCanBoNhan",
               nt.HO              as "hoNguoiTao",
               nt.TEN             as "tenNguoiTao",
               hcthcbk.TRANG_THAI as "trangThai"
        from HCTH_CAN_BO_KY hcthcbk
                 LEFT JOIN TCHC_CAN_BO cbk on hcthcbk.NGUOI_KY = cbk.SHCC
                 LEFT JOIN TCHC_CAN_BO nt on nt.SHCC = hcthcbk.NGUOI_TAO
        where (hcthcbk.CONG_VAN_TRINH_KY = congVanTrinhKy)
        order by hcthcbk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CAN_BO_KY_GET_LIST(
    congVanTrinhKy in number) RETURN SYS_REFCURSOR AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT hcthcbk.ID         as "id",
               hcthcbk.NGUOI_TAO  as "shccNguoiTao",
               hcthcbk.NGUOI_KY   as "nguoiKy",
               cbk.HO             as "hoCanBoNhan",
               cbk.TEN            as "tenCanBoNhan",
               nt.HO              as "hoNguoiTao",
               nt.TEN             as "tenNguoiTao",
               hcthcbk.TRANG_THAI as "trangThai"
        from HCTH_CAN_BO_KY hcthcbk
                 LEFT JOIN TCHC_CAN_BO cbk on hcthcbk.NGUOI_KY = cbk.SHCC
                 LEFT JOIN TCHC_CAN_BO nt on nt.SHCC = hcthcbk.NGUOI_TAO
        where (hcthcbk.CONG_VAN_TRINH_KY = congVanTrinhKy)
        order by hcthcbk.id;
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_SANDBOX_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, imssv IN STRING,
                                       searchTerm IN STRING, filter IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
    namHoc    NUMBER(4);
    hocKy     NUMBER(1);
BEGIN
    SELECT JSON_VALUE(filter, '$.namHoc') INTO namHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.hocKy') INTO hocKy FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TC_HOC_PHI_SANDBOX HP
             LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
    WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
          (NAM_HOC = namHoc AND HOC_KY = hocKy)
      AND (searchTerm = ''
        OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT HP.MSSV                  AS         "mssv",
                     HP.NAM_HOC               AS         "namHoc",
                     HP.HOC_KY                AS         "hocKy",
                     HP.CONG_NO               AS         "congNo",
                     HP.HOC_PHI               AS         "hocPhi",
                     (FS.HO || ' ' || FS.TEN) AS         "hoTenSinhVien",
                     ROW_NUMBER() OVER (ORDER BY FS.TEN) R
              FROM TC_HOC_PHI_SANDBOX HP
                       LEFT JOIN FW_STUDENT FS on HP.MSSV = FS.MSSV
              WHERE (imssv IS NULL OR imssv = '' OR imssv = HP.MSSV) AND
                    (NAM_HOC = namHoc AND HOC_KY = hocKy)
                AND (searchTerm = ''
                  OR LOWER(TRIM(FS.HO || ' ' || FS.TEN)) LIKE sT))
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END ;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TC_HOC_PHI_TRANSACTION_SANDBOX_ADD_BILL(NAM_HOC IN STRING, HOC_KY IN STRING, BANK IN STRING, TRANS_ID IN STRING, TRANS_DATE IN STRING, CUSTOMER_ID IN STRING, BILL_ID IN STRING, SERVICE_ID IN STRING, AMOUNT IN NUMBER, CHECKSUM IN STRING) RETURN NUMBER
AS
    DA_DONG NUMBER;
BEGIN
    INSERT INTO TC_HOC_PHI_TRANSACTION_SANDBOX (BANK, TRANS_ID, TRANS_DATE, CUSTOMER_ID, BILL_ID, SERVICE_ID, AMOUNT, CHECKSUM, NAM_HOC, HOC_KY, STATUS)
        VALUES (BANK, TRANS_ID, TRANS_DATE, CUSTOMER_ID, BILL_ID, SERVICE_ID, AMOUNT, CHECKSUM, NAM_HOC, HOC_KY, 1);

    SELECT SUM(T.AMOUNT) INTO DA_DONG FROM TC_HOC_PHI_TRANSACTION_SANDBOX T WHERE T.NAM_HOC=NAM_HOC AND T.HOC_KY=HOC_KY AND T.CUSTOMER_ID=CUSTOMER_ID AND T.STATUS=1;

    IF DA_DONG IS NULL THEN
        UPDATE TC_HOC_PHI_TRANSACTION_SANDBOX T SET T.STATUS=0 WHERE T.TRANS_ID=TRANS_ID;
        return 0;
    ELSE
        UPDATE TC_HOC_PHI_SANDBOX T SET T.CONG_NO=T.HOC_PHI-DA_DONG WHERE T.NAM_HOC=NAM_HOC AND T.HOC_KY=HOC_KY AND T.MSSV=CUSTOMER_ID;
        COMMIT;
        return 1;
    END IF;
END;

/
--EndMethod--

