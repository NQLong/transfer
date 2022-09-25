CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_CA_NHAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                             searchTerm IN STRING,
                                                             totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                                             searchNam IN NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
    LEFT JOIN (SELECT dangKy.SHCC,
                                         dangKy.ID_NHOM_DANG_KY,
                                         dangKy.nam,
                                         nhom.TEN
                                  FROM TCCB_DANH_GIA_CA_NHAN_DANG_KY dangKy
                                           LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU nhom ON dangKy.ID_NHOM_DANG_KY = nhom.ID
                                  WHERE dangKy.NAM = searchNam) danhGia ON danhGia.SHCC = cb.SHCC
    WHERE searchTerm = ''
       OR LOWER(CB.SHCC) LIKE ST
       OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                 AS          "shcc",
                     CB.HO                   AS          "ho",
                     CB.TEN                  AS          "ten",
                     danhGia.ID_NHOM_DANG_KY as          "idNhomDangKy",
                     danhGia.TEN             as          "tenNhomDangKy",
                     danhGia.NAM             as          "nam",
                     ROW_NUMBER() OVER (ORDER BY CB.TEN) R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN (SELECT dangKy.SHCC,
                                         dangKy.ID_NHOM_DANG_KY,
                                         dangKy.nam,
                                         nhom.TEN
                                  FROM TCCB_DANH_GIA_CA_NHAN_DANG_KY dangKy
                                           LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU nhom ON dangKy.ID_NHOM_DANG_KY = nhom.ID
                                  WHERE dangKy.NAM = searchNam) danhGia ON danhGia.SHCC = cb.SHCC
              WHERE searchTerm = ''
                 OR LOWER(CB.SHCC) LIKE ST
                 OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_PHE_DUYET_DON_VI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                           searchTerm IN STRING,
                                                           totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                                           searchNam IN NUMBER,
                                                           searchDonVi IN STRING) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN (SELECT PD.ID,
                               PD.SHCC,
                               PD.ID_NHOM_DANG_KY,
                               NHOM.TEN as "tenNhomDangKy",
                               PD.TIME_DANG_KY,
                               PD.APPROVED_DON_VI,
                               NHOM.NAM,
                               PDT.APPROVED_TRUONG
                        FROM TCCB_DANH_GIA_PHE_DUYET_DON_VI PD
                                 LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU NHOM ON PD.ID_NHOM_DANG_KY = NHOM.ID
                                 LEFT JOIN TCCB_DANH_GIA_PHE_DUYET_TRUONG PDT ON PD.ID = PDT.ID_PHE_DUYET_CAP_DON_VI
                        WHERE NHOM.NAM = searchNam) pheDuyet
                       ON CB.SHCC = pheDuyet.SHCC
    WHERE CB.MA_DON_VI = searchDonVi
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE ST
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                  AS         "shcc",
                     CB.HO                    AS         "ho",
                     CB.TEN                   AS         "ten",
                     pheDuyet.ID              as         "id",
                     pheDuyet.ID_NHOM_DANG_KY as         "idNhomDangKy",
                     pheDuyet."tenNhomDangKy" as         "tenNhomDangKy",
                     pheDuyet.TIME_DANG_KY    as         "timeDangKy",
                     pheDuyet.APPROVED_DON_VI as         "approvedDonVi",
                     pheDuyet.NAM             as         "nam",
                     pheDuyet.APPROVED_TRUONG as         "approvedTruong",
                     ROW_NUMBER() OVER (ORDER BY CB.TEN) R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN (SELECT PD.ID,
                                         PD.SHCC,
                                         PD.ID_NHOM_DANG_KY,
                                         NHOM.TEN as "tenNhomDangKy",
                                         PD.TIME_DANG_KY,
                                         PD.APPROVED_DON_VI,
                                         NHOM.NAM,
                                         PDT.APPROVED_TRUONG
                                  FROM TCCB_DANH_GIA_PHE_DUYET_DON_VI PD
                                           LEFT JOIN TCCB_NHOM_DANH_GIA_NHIEM_VU NHOM ON PD.ID_NHOM_DANG_KY = NHOM.ID
                                           LEFT JOIN TCCB_DANH_GIA_PHE_DUYET_TRUONG PDT
                                                     ON PD.ID = PDT.ID_PHE_DUYET_CAP_DON_VI
                                  WHERE NHOM.NAM = searchNam) pheDuyet
                                 ON CB.SHCC = pheDuyet.SHCC
              WHERE CB.MA_DON_VI = searchDonVi
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE ST
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST)
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DANH_GIA_PHE_DUYET_TRUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                                      searchTerm IN STRING,
                                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER,
                                                                      searchNam IN NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
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
    WHERE searchTerm = ''
       OR LOWER(CB.SHCC) LIKE ST
       OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
       OR LOWER(donVi.TEN) LIKE ST;

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
                     donVi.TEN AS "tenDonVi",
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
                                        WHERE pddv.NAM = searchNam) pddvn ON pdt.ID_PHE_DUYET_CAP_DON_VI = pddvn.ID) pheDuyet
                                 ON CB.SHCC = pheDuyet.SHCC
                       LEFT JOIN DM_DON_VI donVi ON CB.MA_DON_VI = donVi.MA
              WHERE searchTerm = ''
                 OR LOWER(CB.SHCC) LIKE ST
                 OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                 OR LOWER(donVi.TEN) LIKE ST
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--