CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_PHE_DUYET_TRUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                           searchTerm IN STRING,
                                                           totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                                           searchNam IN NUMBER, filter IN STRING) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
    filterNhom STRING(100);
    filterYKien STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.filterNhom') INTO filterNhom FROM DUAL;
    SELECT JSON_VALUE(filter, '$.filterYKien') INTO filterYKien FROM DUAL;
    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN (SELECT pdt.ID,
                               pdt.APPROVED_TRUONG,
                               pdt.Y_KIEN_TRUONG_TCCB,
                               pdt.TRUONG_TCCB,
                               pdt.USER_DUYET_CAP_TRUONG,
                               pdt.NAM,
                               pddvn.TEN as "tenNhom",
                               pddvn.SHCC,
                               pddvn.APPROVED_DON_VI
                        FROM TCCB_DANH_GIA_PHE_DUYET_TRUONG pdt
                                 LEFT JOIN
                             (SELECT pddv.ID,
                                     pddv.SHCC,
                                     nhom.TEN,
                                     pddv.USER_DUYET_CAP_DON_VI,
                                     pddv.APPROVED_DON_VI
                              FROM TCCB_DANH_GIA_PHE_DUYET_DON_VI pddv
                                       LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU nhom ON pddv.ID_NHOM_DANG_KY = nhom.ID
                              WHERE pddv.NAM = searchNam) pddvn ON pdt.ID_PHE_DUYET_CAP_DON_VI = pddvn.ID) pheDuyet
                       ON CB.SHCC = pheDuyet.SHCC
             LEFT JOIN DM_DON_VI donVi ON CB.MA_DON_VI = donVi.MA
    WHERE (filterNhom = 'Tất cả' OR (filterNhom = 'Chưa đăng ký' AND pheDuyet."tenNhom" IS NULL) OR
           (filterNhom = pheDuyet."tenNhom")) AND
          (filterYKien = 'Tất cả' OR (filterYKien = 'Có ý kiến' AND pheDuyet.Y_KIEN_TRUONG_TCCB IS NOT NULL) OR
           (filterYKien = 'Chưa có ý kiến' AND pheDuyet.Y_KIEN_TRUONG_TCCB IS NULL)) AND (searchTerm = ''
       OR LOWER(CB.SHCC) LIKE ST
       OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
       OR LOWER(donVi.TEN) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                     AS      "shcc",
                     CB.HO                       AS      "ho",
                     CB.TEN                      AS      "ten",
                     pheDuyet.ID                 AS      "id",
                     pheDuyet.APPROVED_DON_VI    AS      "approvedDonVi",
                     pheDuyet.APPROVED_TRUONG    AS      "approvedTruong",
                     pheDuyet."tenNhom"          AS      "tenNhom",
                     pheDuyet.Y_KIEN_TRUONG_TCCB AS      "yKienTruongTccb",
                     donVi.TEN                   AS      "tenDonVi",
                     ROW_NUMBER() OVER (ORDER BY CB.TEN) R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN (SELECT pdt.ID,
                                         pdt.APPROVED_TRUONG,
                                         pdt.Y_KIEN_TRUONG_TCCB,
                                         pdt.TRUONG_TCCB,
                                         pdt.USER_DUYET_CAP_TRUONG,
                                         pdt.NAM,
                                         pddvn.TEN as "tenNhom",
                                         pddvn.SHCC,
                                         pddvn.APPROVED_DON_VI
                                  FROM TCCB_DANH_GIA_PHE_DUYET_TRUONG pdt
                                           LEFT JOIN
                                       (SELECT pddv.ID,
                                               pddv.SHCC,
                                               nhom.TEN,
                                               pddv.USER_DUYET_CAP_DON_VI,
                                               pddv.APPROVED_DON_VI
                                        FROM TCCB_DANH_GIA_PHE_DUYET_DON_VI pddv
                                                 LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU nhom ON pddv.ID_NHOM_DANG_KY = nhom.ID
                                        WHERE pddv.NAM = searchNam) pddvn
                                       ON pdt.ID_PHE_DUYET_CAP_DON_VI = pddvn.ID) pheDuyet
                                 ON CB.SHCC = pheDuyet.SHCC
                       LEFT JOIN DM_DON_VI donVi ON CB.MA_DON_VI = donVi.MA
              WHERE (filterNhom = 'Tất cả' OR (filterNhom = 'Chưa đăng ký' AND pheDuyet."tenNhom" IS NULL) OR
                     (filterNhom = pheDuyet."tenNhom")) AND
                    (filterYKien = 'Tất cả' OR
                     (filterYKien = 'Có ý kiến' AND pheDuyet.Y_KIEN_TRUONG_TCCB IS NOT NULL) OR
                     (filterYKien = 'Chưa có ý kiến' AND pheDuyet.Y_KIEN_TRUONG_TCCB IS NULL)) AND
                    (searchTerm = ''
                 OR LOWER(CB.SHCC) LIKE ST
                 OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                 OR LOWER(donVi.TEN) LIKE ST)
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--