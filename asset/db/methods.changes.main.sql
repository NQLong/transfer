
CREATE OR REPLACE PROCEDURE tccb_danh_gia_form_chuyen_vien_child_gan_thu_tu(p_id in NUMBER, p_thu_tu in number, p_is_up in number,
                                                             p_parent in NUMBER)
    IS
BEGIN
    IF p_is_up = 1 THEN
        UPDATE "TCCB_DANH_GIA_FORM_CHUYEN_VIEN_CHILD" SET thu_tu=thu_tu + 1 WHERE thu_tu >= p_thu_tu AND p_parent = PARENT_ID;
    ELSE
        UPDATE "TCCB_DANH_GIA_FORM_CHUYEN_VIEN_CHILD" SET thu_tu=thu_tu - 1 WHERE thu_tu <= p_thu_tu AND p_parent = PARENT_ID;
    END IF;
    UPDATE "TCCB_DANH_GIA_FORM_CHUYEN_VIEN_CHILD" SET thu_tu=p_thu_tu WHERE id = p_id;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE PROCEDURE tccb_danh_gia_form_chuyen_vien_parent_gan_thu_tu(p_id in NUMBER, p_thu_tu in number, p_is_up in number,
                                                             p_nam in NUMBER)
    IS
BEGIN
    IF p_is_up = 1 THEN
        UPDATE TCCB_DANH_GIA_FORM_CHUYEN_VIEN_PARENT SET thu_tu=thu_tu + 1 WHERE thu_tu >= p_thu_tu AND p_nam = NAM;
    ELSE
        UPDATE TCCB_DANH_GIA_FORM_CHUYEN_VIEN_PARENT SET thu_tu=thu_tu - 1 WHERE thu_tu <= p_thu_tu AND p_nam = NAM;
    END IF;
    UPDATE TCCB_DANH_GIA_FORM_CHUYEN_VIEN_PARENT SET thu_tu=p_thu_tu WHERE id = p_id;
    commit;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_HOI_DONG_CAP_DON_VI_GET_ALL_BY_YEAR(nam IN NUMBER, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hddv.ID          as "id",
                     hddv.SHCC        as "shcc",
                     tccb.HO         as "ho",
                     tccb.TEN        as "ten",
                     hddv.NAM         as "nam",
                     tccb."tenDonVi" as "tenDonVi"
              FROM TCCB_DANH_GIA_HOI_DONG_CAP_DON_VI hddv
                       LEFT JOIN (SELECT cb.HO,
                                         cb.TEN,
                                         cb.SHCC,
                                         dv.TEN as "tenDonVi"
                                  FROM TCHC_CAN_BO cb
                                           LEFT JOIN DM_DON_VI dv ON cb.MA_DON_VI = dv.MA) tccb
                                 ON tccb.SHCC = hddv.SHCC) ds
        WHERE nam = ds."nam"
          AND (searchTerm = '' OR LOWER(ds."shcc") LIKE ST
            OR LOWER(TRIM(ds."ho" || ' ' || ds."ho")) LIKE searchTerm
            OR LOWER(ds."tenDonVi") LIKE searchTerm);
    RETURN my_cursor;
END;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_HOI_DONG_CAP_TRUONG_GET_ALL_BY_YEAR(nam IN NUMBER, searchTerm IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (SELECT hdt.ID          as "id",
                     hdt.SHCC        as "shcc",
                     tccb.HO         as "ho",
                     tccb.TEN        as "ten",
                     hdt.NAM         as "nam",
                     tccb."tenDonVi" as "tenDonVi"
              FROM TCCB_DANH_GIA_HOI_DONG_CAP_TRUONG hdt
                       LEFT JOIN (SELECT cb.HO,
                                         cb.TEN,
                                         cb.SHCC,
                                         dv.TEN as "tenDonVi"
                                  FROM TCHC_CAN_BO cb
                                           LEFT JOIN DM_DON_VI dv ON cb.MA_DON_VI = dv.MA) tccb
                                 ON tccb.SHCC = hdt.SHCC) ds
        WHERE nam = ds."nam"
          AND (searchTerm = '' OR LOWER(ds."shcc") LIKE ST
            OR LOWER(TRIM(ds."ho" || ' ' || ds."ho")) LIKE searchTerm
            OR LOWER(ds."tenDonVi") LIKE searchTerm);
    RETURN my_cursor;
END;

/
--EndMethod--